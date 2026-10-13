import { useEffect, useRef, useState } from "react";

type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      action: string;
      theme: "light";
      size: "flexible";
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => void;
      "timeout-callback": () => void;
    },
  ) => string;
  reset: (id: string) => void;
  remove: (id: string) => void;
};

let sdkPromise: Promise<TurnstileApi> | null = null;

function loadTurnstile(): Promise<TurnstileApi> {
  const api = () => (window as Window & { turnstile?: TurnstileApi }).turnstile;
  const existing = api();
  if (existing) return Promise.resolve(existing);
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise<TurnstileApi>((resolve, reject) => {
    let script = document.querySelector<HTMLScriptElement>(
      'script[data-contact-turnstile="true"]',
    );
    const isNew = !script;
    if (!script) {
      script = document.createElement("script");
      script.src =
        "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.dataset.contactTurnstile = "true";
    }
    const sdkScript = script;
    const cleanup = () => {
      window.clearTimeout(timeout);
      sdkScript.removeEventListener("load", onLoad);
      sdkScript.removeEventListener("error", onError);
    };
    const onLoad = () => {
      cleanup();
      const loaded = api();
      if (loaded) resolve(loaded);
      else {
        sdkScript.remove();
        reject(new Error("Verification did not load."));
      }
    };
    const onError = () => {
      cleanup();
      sdkScript.remove();
      reject(new Error("Verification could not load."));
    };
    const timeout = window.setTimeout(onError, 15_000);
    sdkScript.addEventListener("load", onLoad);
    sdkScript.addEventListener("error", onError);
    if (isNew) document.head.appendChild(sdkScript);
  }).catch((error: unknown) => {
    sdkPromise = null;
    throw error;
  });
  return sdkPromise;
}

export function TurnstileWidget({
  siteKey,
  resetVersion,
  onToken,
  action = "contact",
}: {
  siteKey: string;
  resetVersion: number;
  onToken: (token: string) => void;
  action?: string;
}) {
  const container = useRef<HTMLDivElement>(null);
  const widget = useRef<{ api: TurnstileApi; id: string } | null>(null);
  const tokenCallback = useRef(onToken);
  tokenCallback.current = onToken;
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    tokenCallback.current("");
    void loadTurnstile()
      .then((api) => {
        if (cancelled || !container.current) return;
        const failed = () => {
          if (cancelled) return;
          tokenCallback.current("");
          setError("Verification needs another attempt. Please retry.");
        };
        const id = api.render(container.current, {
          sitekey: siteKey,
          action,
          theme: "light",
          size: "flexible",
          callback: (token) => {
            if (cancelled) return;
            setError("");
            tokenCallback.current(token);
          },
          "expired-callback": () => {
            if (!cancelled) tokenCallback.current("");
          },
          "error-callback": failed,
          "timeout-callback": failed,
        });
        widget.current = { api, id };
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setLoading(false);
          setError(
            "Verification could not load. Check your connection and retry.",
          );
        }
      });
    return () => {
      cancelled = true;
      if (widget.current) {
        try {
          widget.current.api.remove(widget.current.id);
        } catch {
          // The verification frame may already have been removed by the SDK.
        }
        widget.current = null;
      }
    };
  }, [siteKey, retry, action]);

  useEffect(() => {
    tokenCallback.current("");
    if (widget.current) {
      try {
        widget.current.api.reset(widget.current.id);
      } catch {
        setError("Verification needs another attempt. Please retry.");
      }
    }
  }, [resetVersion]);

  return (
    <div className="contact-verification-widget">
      <div ref={container} />
      {loading && <p role="status">Loading verification…</p>}
      {error && (
        <div className="contact-verification-error" role="alert">
          <p>{error}</p>
          <button type="button" onClick={() => setRetry((value) => value + 1)}>
            Retry verification
          </button>
        </div>
      )}
    </div>
  );
}

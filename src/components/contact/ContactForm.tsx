import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowUpRight, Check } from "lucide-react";
import { TurnstileWidget } from "./TurnstileWidget";
import "./contact-form.css";
import { CountrySelect } from "./CountrySelect";
import { profile } from "../../data/profile";
import { COUNTRY_CODES, BUDGET_OPTIONS, BUDGET_CURRENCY, CONTACT_RETENTION_DAYS } from "../../../shared/contact";

const countryCodes = COUNTRY_CODES;
const budgets = BUDGET_OPTIONS;

type Values = {
  name: string;
  email: string;
  phone: string;
  country: string;
  kind: string;
  description: string;
  budget: string;
  consent: boolean;
  website: string;
};
type Field = keyof Values | "turnstileToken";
type FieldErrors = Partial<Record<Field, string>>;
type Config = { siteKey: string | null; local: boolean; hosting: 'cloudflare' | 'vercel' };
const initialValues: Values = {
  name: "",
  email: "",
  phone: "",
  country: "",
  kind: "project",
  description: "",
  budget: "",
  consent: false,
  website: "",
};
const knownFields: Field[] = [
  "name",
  "email",
  "phone",
  "country",
  "kind",
  "description",
  "budget",
  "consent",
  "turnstileToken",
];

function validate(values: Values, token: string): FieldErrors {
  const fields: FieldErrors = {};
  const name = values.name.normalize("NFC").trim();
  const email = values.email.normalize("NFC").trim();
  const phone = values.phone.normalize("NFC").trim();
  const description = values.description.normalize("NFC").trim();
  const control = /[\u0000-\u001f\u007f-\u009f]/;
  const emailLocal = email.split("@")[0];
  if (
    name.length < 2 ||
    name.length > 100 ||
    control.test(name) ||
    /[<>]/.test(name)
  )
    fields.name = "Enter your name using 2–100 characters.";
  if (
    email.length > 254 ||
    control.test(email) ||
    emailLocal.startsWith(".") ||
    emailLocal.endsWith(".") ||
    emailLocal.includes("..") ||
    !/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]{1,64}@[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?\.[A-Za-z]{2,63}$/.test(
      email,
    ) ||
    email
      .split("@")[1]
      ?.split(".")
      .some(
        (label) =>
          !label ||
          label.length > 63 ||
          label.startsWith("-") ||
          label.endsWith("-"),
      )
  )
    fields.email = "Enter a valid email address.";
  if (
    phone &&
    (phone.length > 35 ||
      !/^\+?[0-9 ()\-.]+$/.test(phone) ||
      phone.replace(/\D/g, "").length < 7 ||
      phone.replace(/\D/g, "").length > 15)
  )
    fields.phone =
      "Enter a phone number with 7–15 digits, including your country code.";
  if (!countryCodes.includes(values.country))
    fields.country = "Select your country or region.";
  if (!["project", "collaboration"].includes(values.kind))
    fields.kind = "Select a project or collaboration.";
  if (
    description.length < 20 ||
    description.length > 2000 ||
    /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f]/.test(description)
  )
    fields.description = "Describe your idea using 20–2,000 characters.";
  if (!budgets.some(([value]) => value === values.budget))
    fields.budget = "Choose a budget range, or select Let’s discuss.";
  if (!values.consent)
    fields.consent =
      "Please agree to the use of your details to respond to this inquiry.";
  if (!token)
    fields.turnstileToken = "Complete the verification before sending.";
  return fields;
}

export function ContactForm() {
  const shell = useRef<HTMLDivElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const errorSummary = useRef<HTMLDivElement>(null);
  const successPanel = useRef<HTMLDivElement>(null);
  const activeRequest = useRef<AbortController | null>(null);
  const submittingRef = useRef(false);
  const mounted = useRef(true);
  const [activated, setActivated] = useState(false);
  const [configAttempt, setConfigAttempt] = useState(0);
  const [config, setConfig] = useState<Config | null>(null);
  const [configLoading, setConfigLoading] = useState(false);
  const [configError, setConfigError] = useState("");
  const [values, setValues] = useState<Values>(initialValues);
  const [fields, setFields] = useState<FieldErrors>({});
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const [resetVersion, setResetVersion] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState("");

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      activeRequest.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!shell.current) return;
    if (!("IntersectionObserver" in window)) {
      setActivated(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setActivated(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(shell.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!activated) return;
    const controller = new AbortController();
    let cancelled = false;
    const timeout = window.setTimeout(() => controller.abort(), 12_000);
    setConfigLoading(true);
    setConfigError("");
    void fetch("/api/contact/config", {
      headers: { Accept: "application/json" },
      credentials: "same-origin",
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Configuration unavailable.");
        const data: unknown = await response.json();
        if (!data || typeof data !== "object")
          throw new Error("Invalid configuration.");
        const candidate = data as Record<string, unknown>;
        if (
          typeof candidate.local !== "boolean" ||
          !(candidate.siteKey === null || typeof candidate.siteKey === "string")
        )
          throw new Error("Invalid configuration.");
        const localhost = ["localhost", "127.0.0.1", "[::1]", "::1"].includes(
          window.location.hostname,
        );
        if (candidate.local && !localhost)
          throw new Error(
            "Development verification is only available on localhost.",
          );
        if (!candidate.local && !candidate.siteKey)
          throw new Error("Verification is not configured.");
        if (!cancelled)
          setConfig({
            siteKey: candidate.siteKey as string | null,
            local: candidate.local,
            hosting: candidate.hosting === 'vercel' ? 'vercel' : 'cloudflare',
          });
      })
      .catch(() => {
        if (!cancelled) {
          setConfig(null);
          setConfigError(
            "The form is temporarily unavailable. Please retry, or connect through LinkedIn below.",
          );
        }
      })
      .finally(() => {
        window.clearTimeout(timeout);
        if (!cancelled) setConfigLoading(false);
      });
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [activated, configAttempt]);

  useEffect(() => {
    if (reference) successPanel.current?.focus();
  }, [reference]);

  const update = <Key extends keyof Values>(key: Key, value: Values[Key]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setFields((current) => ({ ...current, [key]: undefined }));
  };
  const focusError = (nextFields: FieldErrors) => {
    const first = knownFields.find((field) => nextFields[field]);
    window.requestAnimationFrame(() => {
      const target = first === "turnstileToken"
        ? form.current?.querySelector<HTMLElement>(".contact-verification")
        : first ? form.current?.querySelector<HTMLElement>(`[name="${first}"]`)
        : errorSummary.current;
      target?.focus({ preventScroll: true });
      target?.scrollIntoView({ block: "center", behavior: "instant" });
    });
  };
  const fieldError = (field: Field) =>
    fields[field] ? (
      <p className="contact-field-error" id={`contact-${field}-error`}>
        {fields[field]}
      </p>
    ) : null;
  const fieldAttributes = (field: Field) => ({
    "aria-invalid": fields[field] ? (true as const) : undefined,
    "aria-describedby": fields[field] ? `contact-${field}-error` : undefined,
    disabled: submitting,
  });

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submittingRef.current || reference) return;
    setActivated(true);
    setError("");
    if (!config) {
      setError(
        "The form is not ready yet. Please wait for verification or retry below.",
      );
      focusError({});
      return;
    }
    const nextFields = validate(values, token);
    setFields(nextFields);
    if (Object.keys(nextFields).length) {
      setError("Please check the highlighted fields.");
      focusError(nextFields);
      return;
    }
    submittingRef.current = true;
    setSubmitting(true);
    const controller = new AbortController();
    activeRequest.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 25_000);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "same-origin",
        signal: controller.signal,
        body: JSON.stringify({
          ...values,
          name: values.name.trim(),
          email: values.email.trim(),
          phone: values.phone.trim(),
          description: values.description.trim(),
          turnstileToken: token,
        }),
      });
      const data: unknown = await response.json();
      if (!mounted.current) return;
      const result =
        data && typeof data === "object"
          ? (data as Record<string, unknown>)
          : {};
      if (
        response.ok &&
        result.ok === true &&
        typeof result.reference === "string" &&
        result.reference.length > 0 &&
        result.reference.length <= 100
      ) {
        setReference(result.reference);
        setValues(initialValues);
        setFields({});
      } else {
        const nextErrors: FieldErrors = {};
        if (result.fields && typeof result.fields === "object") {
          const serverFields = result.fields as Record<string, unknown>;
          for (const field of knownFields) {
            const message = serverFields[field];
            if (typeof message === "string" && message.length <= 500)
              nextErrors[field] = message;
          }
        }
        setFields(nextErrors);
        setError(
          typeof result.error === "string" && result.error.length <= 500
            ? result.error
            : response.status === 429
              ? "Too many attempts. Please wait before trying again."
              : "Your inquiry could not be saved. Please retry.",
        );
        focusError(nextErrors);
      }
    } catch {
      if (mounted.current) {
        setError(
          controller.signal.aborted
            ? "The request timed out. Your details are still here. Please verify again and retry."
            : "Your inquiry could not be confirmed. Check your connection, verify again, and retry.",
        );
        focusError({});
      }
    } finally {
      window.clearTimeout(timeout);
      activeRequest.current = null;
      submittingRef.current = false;
      if (mounted.current) {
        setSubmitting(false);
        setToken("");
        setResetVersion((version) => version + 1);
      }
    }
  };

  return (
    <div
      className="contact-form-shell"
      ref={shell}
      onFocusCapture={() => setActivated(true)}
    >
      {reference ? (
        <div
          className="contact-success"
          ref={successPanel}
          role="status"
          tabIndex={-1}
        >
          <Check size={28} aria-hidden="true" />
          <h3>Your inquiry has been received.</h3>
          <p>
            Your project details have been saved. I’ll use your email to
            respond.
          </p>
          <p>Reference: {reference}</p>
          <button
            type="button"
            onClick={() => {
              setReference("");
              window.requestAnimationFrame(() =>
                form.current
                  ?.querySelector<HTMLInputElement>("#contact-name")
                  ?.focus(),
              );
            }}
          >
            Send another inquiry <ArrowUpRight size={18} aria-hidden="true" />
          </button>
        </div>
      ) : (
        <>
          <div className="contact-form-intro">
            <h3>Tell me what you’re thinking.</h3>
            <p>
              Share a little about your project or collaboration. All fields are
              required except your phone number.
            </p>
          </div>
          <form
            ref={form}
            className="contact-form"
            onSubmit={submit}
            noValidate
          >
            {error && (
              <div
                className="contact-form-error"
                ref={errorSummary}
                role="alert"
                tabIndex={-1}
              >
                {error}
              </div>
            )}
            <div className="contact-honeypot" aria-hidden="true">
              <label htmlFor="contact-website">Leave this field empty</label>
              <input
                id="contact-website"
                name="website"
                type="text"
                autoComplete="off"
                tabIndex={-1}
                value={values.website}
                onChange={(event) => update("website", event.target.value)}
              />
            </div>
            <div className="contact-form-grid">
              <div className="contact-field">
                <label htmlFor="contact-name">Your name</label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  required
                  minLength={2}
                  maxLength={100}
                  autoComplete="name"
                  value={values.name}
                  onChange={(event) => update("name", event.target.value)}
                  {...fieldAttributes("name")}
                />
                {fieldError("name")}
              </div>
              <div className="contact-field">
                <label htmlFor="contact-email">Email address</label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  required
                  maxLength={254}
                  autoComplete="email"
                  value={values.email}
                  onChange={(event) => update("email", event.target.value)}
                  {...fieldAttributes("email")}
                />
                {fieldError("email")}
              </div>
              <div className="contact-field">
                <label htmlFor="contact-phone">
                  Phone number <span>(optional)</span>
                </label>
                <input
                  id="contact-phone"
                  name="phone"
                  type="tel"
                  maxLength={35}
                  autoComplete="tel"
                  placeholder="Include your country code"
                  value={values.phone}
                  onChange={(event) => update("phone", event.target.value)}
                  {...fieldAttributes("phone")}
                />
                {fieldError("phone")}
              </div>
              <div className="contact-field">
                <label htmlFor="contact-country">Country or region</label>
                <CountrySelect
                  value={values.country}
                  onChange={(country) => update("country", country)}
                  {...fieldAttributes("country")}
                />
                {fieldError("country")}
              </div>
              <div className="contact-field">
                <label htmlFor="contact-kind">I’m reaching out about</label>
                <select
                  id="contact-kind"
                  name="kind"
                  required
                  value={values.kind}
                  onChange={(event) => update("kind", event.target.value)}
                  {...fieldAttributes("kind")}
                >
                  <option value="project">A project</option>
                  <option value="collaboration">A collaboration</option>
                </select>
                {fieldError("kind")}
              </div>
              <div className="contact-field">
                <label htmlFor="contact-budget">
                  Budget range <span>({BUDGET_CURRENCY})</span>
                </label>
                <select
                  id="contact-budget"
                  name="budget"
                  required
                  value={values.budget}
                  onChange={(event) => update("budget", event.target.value)}
                  {...fieldAttributes("budget")}
                >
                  <option value="">Select your budget</option>
                  {budgets.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                {fieldError("budget")}
              </div>
              <div className="contact-field contact-field-wide">
                <label htmlFor="contact-description">
                  A little about your idea
                </label>
                <textarea
                  id="contact-description"
                  name="description"
                  required
                  minLength={20}
                  maxLength={2000}
                  rows={5}
                  placeholder="What would you like to build, improve, or collaborate on? A rough scope and timeline are helpful."
                  value={values.description}
                  onChange={(event) =>
                    update("description", event.target.value)
                  }
                  {...fieldAttributes("description")}
                  aria-describedby={
                    fields.description
                      ? "contact-description-help contact-description-error"
                      : "contact-description-help"
                  }
                />
                <div
                  className="contact-field-help"
                  id="contact-description-help"
                >
                  <span>
                    20–2,000 characters. Please leave out sensitive information.
                  </span>
                  <span>{values.description.length}/2,000</span>
                </div>
                {fieldError("description")}
              </div>
            </div>
            <label className="contact-consent" htmlFor="contact-consent">
              <input
                id="contact-consent"
                name="consent"
                type="checkbox"
                required
                checked={values.consent}
                onChange={(event) => update("consent", event.target.checked)}
                {...fieldAttributes("consent")}
              />
              <span>
                I agree to {profile.name} storing my details and using them to
                respond to this inquiry.
              </span>
            </label>
            {fieldError("consent")}
            <details className="contact-privacy">
              <summary>How your information is used</summary>
              <p>
                Your name, email, optional phone number, country, budget, and
                project details are stored privately to review and respond to
                your inquiry. They are not used for marketing. Inquiries are
                scheduled for deletion from the database after {CONTACT_RETENTION_DAYS} days.
              </p>
              {config?.hosting === 'vercel' && <p>
                A copy of your submitted details is emailed to me through Resend
                so I can review your requirements and reply to your email address.
                Email copies remain in my inbox until deleted.
              </p>}
              <p>
                {config?.hosting === 'vercel'
                  ? 'The production form is hosted by Vercel and its database by Turso.'
                  : 'The production form and database are hosted by Cloudflare.'}
                Cloudflare Turnstile processes verification and connection
                signals to prevent automated abuse. Contact me through the
                LinkedIn link below to request access to or deletion of your
                inquiry; include your submission reference. Deletion runs on a scheduled basis after expiry.
              </p>
            </details>
            <div
              className="contact-verification"
              tabIndex={-1}
              aria-label="Form verification"
              aria-describedby={
                fields.turnstileToken
                  ? "contact-turnstileToken-error"
                  : undefined
              }
            >
              <h4>Verification</h4>
              {!activated || configLoading ? (
                <p role="status">Preparing verification…</p>
              ) : configError ? (
                <div role="alert">
                  <p>{configError}</p>
                  <button
                    className="contact-config-retry"
                    type="button"
                    onClick={() => setConfigAttempt((attempt) => attempt + 1)}
                  >
                    Retry form connection
                  </button>
                </div>
              ) : config?.local ? (
                <>
                  <p className="contact-development-notice">
                    Local development: this checkbox tests the form on
                    localhost. Live submissions require Cloudflare Turnstile
                    verification.
                  </p>
                  <label className="contact-local-verification">
                    <input
                      type="checkbox"
                      checked={token === "local-development-only"}
                      disabled={submitting}
                      onChange={(event) =>
                        setToken(
                          event.target.checked ? "local-development-only" : "",
                        )
                      }
                    />
                    <span>Verify this local test submission</span>
                  </label>
                </>
              ) : config?.siteKey ? (
                <TurnstileWidget
                  siteKey={config.siteKey}
                  resetVersion={resetVersion}
                  onToken={(value) => {
                    setToken(value);
                    if (value)
                      setFields((current) => ({
                        ...current,
                        turnstileToken: undefined,
                      }));
                  }}
                />
              ) : null}
              {fieldError("turnstileToken")}
            </div>
            <div className="contact-form-submit-row">
              <button
                className="contact-submit"
                type="submit"
                disabled={submitting || !config || configLoading}
              >
                {submitting ? "Sending inquiry…" : "Send inquiry"}
                <ArrowUpRight size={18} aria-hidden="true" />
              </button>
              <p role="status">
                {submitting
                  ? "Please wait while your inquiry is saved."
                  : "Your details stay private."}
              </p>
            </div>
          </form>
        </>
      )}
    </div>
  );
}

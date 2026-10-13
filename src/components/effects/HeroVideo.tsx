import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "../../hooks/useReducedMotion";

export function HeroVideo() {
  const video = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();
  const connection = (
    navigator as Navigator & { connection?: { saveData?: boolean } }
  ).connection;
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const enabled = !reduced && !connection?.saveData && !failed;

  useEffect(() => {
    const element = video.current;
    if (!enabled || !element) return;
    let visible = true;
    const update = () => {
      if (visible && !document.hidden) {
        element.play().catch(() => {
          /* The static poster remains visible when autoplay is blocked. */
        });
      } else element.pause();
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        update();
      },
      { threshold: 0.05 },
    );
    observer.observe(element.closest(".hero") || element);
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
      element.pause();
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <>
      <video
        ref={video}
        className={`hero-video ${ready ? "is-ready" : ""}`}
        src="/videos/abstract-technology-30s.mp4"
        poster="/images/abstract-tech-poster.jpg"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
        tabIndex={-1}
        onPlaying={() => {
          setReady(true);
        }}
        onError={() => setFailed(true)}
      />
    </>
  );
}

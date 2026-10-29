import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Lenis from "lenis";
import { useMediaQuery, useReducedMotion } from "../../hooks/useReducedMotion";

gsap.registerPlugin(ScrollTrigger, useGSAP);
export function ScrollExperience({ children }: { children: ReactNode }) {
  const scope = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const mobile = useMediaQuery("(max-width: 767px)");
  useGSAP(
    () => {
      if (reduced) return;
      let idleId: number | undefined;
      let cancelled = false;
      let stop = () => {};
      const start = () => {
        if (cancelled) return;
        const lenis = new Lenis({
        autoRaf: false,
        lerp: 0.3,
        wheelMultiplier: 1,
        smoothWheel: false,
        syncTouch: false,
      });
      const syncScroll = () => ScrollTrigger.update();
      const raf = (time: number) => lenis.raf(time * 1000);
      lenis.on("scroll", syncScroll);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
      const scrub = (
        trigger: Element | string,
        start = "top bottom",
        end = "bottom top",
      ) => ({ trigger, start, end, scrub: 0.6 });
      gsap.to(".scroll-progress", {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: scope.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.3,
        },
      });
      gsap.fromTo(
        ".hero-background, .hero-video",
        { scale: 1.04, yPercent: 0 },
        {
          scale: 1.08,
          yPercent: 3,
          ease: "none",
          scrollTrigger: scrub(".hero", "top top"),
        },
      );
      gsap.to(".hero-copy", {
        y: mobile ? -8 : -20,
        ease: "none",
        scrollTrigger: scrub(".hero", "top top"),
      });
      gsap.to(".hero-stamp", {
        y: -12,
        x: mobile ? 0 : 10,
        ease: "none",
        scrollTrigger: scrub(".hero", "top top"),
      });
      gsap.fromTo(
        ".about-visual .engineering-illustration",
        { y: 10, rotation: -2 },
        {
          y: -6,
          rotation: 1.5,
          ease: "none",
          scrollTrigger: scrub(".about-section"),
        },
      );
      gsap.fromTo(
        ".approach-visual .engineering-illustration",
        { rotation: -5, y: 8 },
        {
          rotation: 5,
          y: -6,
          ease: "none",
          scrollTrigger: scrub(".approach-section"),
        },
      );
      gsap.utils.toArray<HTMLElement>(".capability").forEach((card) => {
        gsap.fromTo(
          card,
          { y: 10 },
          {
            y: 0,
            ease: "none",
            scrollTrigger: scrub(card, "top 95%", "top 45%"),
          },
        );
      });
      gsap.fromTo(
        ".contact-headline",
        { y: 28 },
        { y: -10, ease: "none", scrollTrigger: scrub(".contact-section") },
      );
      let frame = 0;
      const observer = new ResizeObserver(() => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => ScrollTrigger.refresh());
      });
      if (scope.current) observer.observe(scope.current);
        stop = () => {
        gsap.ticker.remove(raf);
        lenis.off("scroll", syncScroll);
        lenis.destroy();
        observer.disconnect();
        cancelAnimationFrame(frame);
      };
      };
      if ("requestIdleCallback" in window) {
        idleId = window.requestIdleCallback(start, { timeout: 1200 });
      } else {
        idleId = Number(setTimeout(start, 120));
      }
      return () => {
        cancelled = true;
        stop();
        if ("cancelIdleCallback" in window && idleId !== undefined) window.cancelIdleCallback(idleId);
        else if (idleId !== undefined) clearTimeout(idleId);
      };
    },
    { scope, dependencies: [reduced, mobile], revertOnUpdate: true },
  );
  return (
    <div ref={scope} className="motion-page">
      <div className="scroll-progress" aria-hidden="true" />
      {children}
    </div>
  );
}

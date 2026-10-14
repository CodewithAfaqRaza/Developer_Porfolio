import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useMediaQuery, useReducedMotion } from "../../hooks/useReducedMotion";

gsap.registerPlugin(ScrollTrigger, useGSAP);
export function ScrollExperience({ children }: { children: ReactNode }) {
  const scope = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const mobile = useMediaQuery("(max-width: 767px)");
  useGSAP(
    () => {
      if (reduced) return;
      const scrub = (
        trigger: Element | string,
        start = "top bottom",
        end = "bottom top",
      ) => ({ trigger, start, end, scrub: 0.9 });
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
          scale: 1.16,
          yPercent: 7,
          ease: "none",
          scrollTrigger: scrub(".hero", "top top"),
        },
      );
      gsap.to(".hero-copy", {
        y: mobile ? -20 : -50,
        ease: "none",
        scrollTrigger: scrub(".hero", "top top"),
      });
      gsap.to(".hero-stamp", {
        y: -30,
        x: mobile ? 0 : 30,
        ease: "none",
        scrollTrigger: scrub(".hero", "top top"),
      });
      gsap.fromTo(
        ".about-visual .engineering-illustration",
        { y: 25, rotation: -4 },
        {
          y: -15,
          rotation: 3,
          ease: "none",
          scrollTrigger: scrub(".about-section"),
        },
      );
      gsap.fromTo(
        ".approach-visual .engineering-illustration",
        { rotation: -12, y: 20 },
        {
          rotation: 12,
          y: -15,
          ease: "none",
          scrollTrigger: scrub(".approach-section"),
        },
      );
      gsap.utils.toArray<HTMLElement>(".capability").forEach((card) => {
        gsap.fromTo(
          card,
          { y: 22 },
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
      return () => {
        observer.disconnect();
        cancelAnimationFrame(frame);
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

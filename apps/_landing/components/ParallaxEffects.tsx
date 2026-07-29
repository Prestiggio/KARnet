"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Applies subtle scroll parallax to any element carrying
 * `data-parallax-speed`. Positive speeds drift the element up as the
 * page scrolls down (background layers); negative speeds drift it the
 * opposite way, faster than scroll, to read as "closer" (foreground
 * elements). Skipped entirely under `prefers-reduced-motion`, matching
 * the rest of the site's motion policy.
 */
export default function ParallaxEffects() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const elements = gsap.utils.toArray<HTMLElement>(
        "[data-parallax-speed]"
      );

      elements.forEach((el) => {
        const speed = parseFloat(el.dataset.parallaxSpeed ?? "0.2");

        gsap.to(el, {
          y: () => window.innerHeight * speed * -1,
          ease: "none",
          scrollTrigger: {
            trigger: el.closest<HTMLElement>("[data-parallax-scope]") ?? el,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      });
    });

    return () => mm.revert();
  }, []);

  return null;
}

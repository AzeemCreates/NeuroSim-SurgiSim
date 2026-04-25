import { useLayoutEffect, useRef } from "react";
import anime from "animejs";

type EntranceVariant = "panel" | "modal" | "status";

type UseAnimeEntranceOptions = {
  variant?: EntranceVariant;
  enabled?: boolean;
  delay?: number;
  duration?: number;
  selector?: string;
};

const variants: Record<EntranceVariant, Record<string, unknown>> = {
  panel: {
    opacity: [0, 1],
    translateX: [-28, 0],
    easing: "easeOutExpo",
  },
  modal: {
    opacity: [0, 1],
    translateY: [20, 0],
    scale: [0.96, 1],
    easing: "easeOutExpo",
  },
  status: {
    opacity: [0, 1],
    translateY: [12, 0],
    easing: "easeOutSine",
  },
};

export function useAnimeEntrance<T extends HTMLElement>({
  variant = "panel",
  enabled = true,
  delay = 0,
  duration = 900,
  selector = "[data-entrance-item]",
}: UseAnimeEntranceOptions = {}) {
  const rootRef = useRef<T | null>(null);

  useLayoutEffect(() => {
    const rootElement = rootRef.current;

    if (!enabled || !rootElement) {
      return;
    }

    const collectedTargets = rootElement.querySelectorAll<HTMLElement>(selector);
    const targets = collectedTargets.length
      ? Array.from(collectedTargets)
      : [rootElement];

    anime.remove(targets);
    anime.set(targets, {
      opacity: 0,
    });

    const animation = anime({
      targets,
      ...variants[variant],
      delay: anime.stagger(110, { start: delay }),
      duration,
    });

    return () => {
      animation.pause();
      anime.remove(targets);
    };
  }, [delay, duration, enabled, selector, variant]);

  return rootRef;
}

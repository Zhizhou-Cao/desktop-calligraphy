import { useEffect } from "react";
import type { PlaybackMode } from "../types/library";
import type { PhraseEntry } from "../types/phrase";

/**
 * Advances currentIndex on a timer according to mode.
 *  - "pause": does nothing.
 *  - "forward"/"backward": step through the full library in order.
 *  - "random": jumps to a random other entry each interval.
 *  - "favorite": cycles forward through only the starred entries; if none
 *    are starred there's nothing eligible, so it just holds still.
 * Manual selection (setCurrentIndex called from elsewhere, e.g. the
 * library list) is left completely alone here — the next tick just
 * continues from wherever the index currently is.
 */
export function usePhraseRotation(
  mode: PlaybackMode,
  phrases: PhraseEntry[],
  intervalSeconds: number,
  setCurrentIndex: (updater: (prev: number) => number) => void,
) {
  useEffect(() => {
    if (mode === "pause") return;

    const eligible =
      mode === "favorite"
        ? phrases.reduce<number[]>((indices, phrase, index) => {
            if (phrase.favorite) indices.push(index);
            return indices;
          }, [])
        : phrases.map((_, index) => index);

    if (eligible.length <= 1) return;

    const id = setInterval(() => {
      setCurrentIndex((prev) => {
        const position = eligible.indexOf(prev);
        if (mode === "backward") {
          const nextPosition =
            position <= 0 ? eligible.length - 1 : position - 1;
          return eligible[nextPosition];
        }
        if (mode === "random") {
          let nextPosition = Math.floor(Math.random() * eligible.length);
          if (eligible[nextPosition] === prev) {
            nextPosition = (nextPosition + 1) % eligible.length;
          }
          return eligible[nextPosition];
        }
        // "forward" and "favorite" both just step forward through
        // whichever list is eligible.
        const nextPosition = position === -1 ? 0 : (position + 1) % eligible.length;
        return eligible[nextPosition];
      });
    }, intervalSeconds * 1000);

    return () => clearInterval(id);
  }, [mode, phrases, intervalSeconds, setCurrentIndex]);
}

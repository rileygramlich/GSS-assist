import { useCallback, useEffect, useRef, useState } from "react";

/** One source of truth for whether the visitor has asked us to stop moving things. */
export function prefersReducedMotion() {
    return (
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
}

/**
 * Reveal-on-scroll. Returns a ref and a boolean; the element stays revealed once
 * it has been seen, so scrolling back up does not replay the animation.
 */
export function useReveal({ threshold = 0.15, rootMargin = "0px 0px -12% 0px" } = {}) {
    const ref = useRef(null);
    const [shown, setShown] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        if (prefersReducedMotion()) {
            setShown(true);
            return;
        }

        const io = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setShown(true);
                    io.disconnect();
                }
            },
            { threshold, rootMargin }
        );
        io.observe(el);
        return () => io.disconnect();
    }, [threshold, rootMargin]);

    return [ref, shown];
}

/**
 * Cursor-tracked specular highlight. Writes --mx/--my onto the element, which the
 * .glass::before gradient reads. Pointer events only — touch never fires these,
 * so mobile simply gets the panel without a highlight.
 */
export function useSpecular() {
    const ref = useRef(null);

    const onPointerMove = useCallback((e) => {
        const el = ref.current;
        if (!el || e.pointerType !== "mouse") return;
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${e.clientX - r.left}px`);
        el.style.setProperty("--my", `${e.clientY - r.top}px`);
    }, []);

    return { ref, onPointerMove };
}

/**
 * Counts a number up when it first scrolls into view, and re-runs whenever the
 * target changes after that — so the calculator's totals animate on every drag
 * rather than snapping.
 */
export function useCountUp(target, { duration = 900, decimals = 0 } = {}) {
    const [ref, shown] = useReveal({ threshold: 0.3 });
    /* Seeded with the real figure, not 0. While the element is still offscreen
       nobody sees this value, but it means an environment where rAF or the
       observer never runs shows the truth rather than a headline reading $0. */
    const [value, setValue] = useState(target);
    const displayed = useRef(target);
    const started = useRef(false);
    const frame = useRef(0);

    useEffect(() => {
        if (!shown) return;

        if (prefersReducedMotion()) {
            displayed.current = target;
            setValue(target);
            return;
        }

        // the entrance counts up from zero; every change after that eases from
        // whatever is on screen right now, so dragging a slider never snaps back
        const origin = started.current ? displayed.current : 0;
        started.current = true;

        const start = performance.now();
        const delta = target - origin;

        const tick = (now) => {
            const t = Math.min((now - start) / duration, 1);
            // easeOutExpo — fast commitment, soft landing
            const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
            const next = Number((origin + delta * eased).toFixed(decimals));
            displayed.current = next;
            setValue(next);
            if (t < 1) frame.current = requestAnimationFrame(tick);
        };

        cancelAnimationFrame(frame.current);
        frame.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame.current);
    }, [target, shown, duration, decimals]);

    return [ref, value];
}

/** Raw window scrollY, rAF-throttled. Used by the nav and the aurora parallax. */
export function useScrollY() {
    const [y, setY] = useState(0);

    useEffect(() => {
        let ticking = false;
        const onScroll = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                setY(window.scrollY);
                ticking = false;
            });
        };
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return y;
}

/** Which section id is currently under the nav, for the active link indicator. */
export function useActiveSection(ids) {
    const [active, setActive] = useState(ids[0]);

    useEffect(() => {
        const sections = ids
            .map((id) => document.getElementById(id))
            .filter(Boolean);
        if (!sections.length) return;

        const io = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((e) => e.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
                if (visible) setActive(visible.target.id);
            },
            { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 1] }
        );

        sections.forEach((s) => io.observe(s));
        return () => io.disconnect();
    }, [ids]);

    return active;
}

import { useEffect, useRef } from "react";
import "./Aurora.css";
import { prefersReducedMotion } from "../useMotion";

/**
 * The fixed light behind everything. One slow colour field, plus a grain layer
 * that keeps the gradient from banding on cheap panels. This was three drifting
 * fields — at that density the background competed with the content instead of
 * sitting behind it.
 *
 * Parallax is applied by writing a CSS variable rather than re-rendering — this
 * component paints once and is never touched by React again.
 */
function Aurora() {
    const ref = useRef(null);

    useEffect(() => {
        const el = ref.current;
        if (!el || prefersReducedMotion()) return;

        let ticking = false;
        const onScroll = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                el.style.setProperty("--scroll", String(window.scrollY));
                ticking = false;
            });
        };

        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <div className="aurora" ref={ref} aria-hidden="true">
            <div className="aurora-blob aurora-blob-1" />
            <div className="aurora-grid" />
            <div className="aurora-grain" />
            <div className="aurora-vignette" />
        </div>
    );
}

export default Aurora;

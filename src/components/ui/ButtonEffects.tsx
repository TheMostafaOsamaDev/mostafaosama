"use client";

import { useEffect } from "react";

const REDUCE = "(prefers-reduced-motion: reduce)";
/** GSAP's power2.inOut, the reference's ease for the fill. */
const FILL_EASE = "cubic-bezier(0.455, 0.03, 0.515, 0.955)";
/** The fill's duration, from --fill-time (the fillTime setting). */
const fillMs = (el: HTMLElement) => (parseFloat(getComputedStyle(el).getPropertyValue("--fill-time")) || 0.6) * 1000;

/**
 * The buttons' hover, after dennissnellenberg.com (mouse only; touch gets the plain press):
 *
 * - Magnetic: while the cursor is on a `.btn[data-magnetic="strength follow"]`, the button follows it, `strength` px
 *   at the edge, and its label `follow` times further. buttons.css glides it there (1.5 s ease-out, re-targeted on
 *   every move) and springs it back when the cursor leaves. Off under reduced motion.
 * - Fill: on a `.btn[data-fill]`, the `.btn-fill` oval drops below the button and slides up over it; on leave it
 *   carries on out through the top. `data-hot` marks the filled state for the text colour. Under reduced motion it
 *   just fills.
 */
export function ButtonEffects() {
  useEffect(() => {
    const reduced = () => {
      const motion = document.documentElement.dataset.motion;
      return motion === "reduce" || (motion !== "full" && matchMedia(REDUCE).matches);
    };
    let active: HTMLElement | null = null;
    let last: PointerEvent | null = null;
    let raf = 0;

    const release = (el: HTMLElement) => {
      for (const v of ["--tx", "--ty", "--lx", "--ly"]) el.style.removeProperty(v);
      delete el.dataset.tracking;
    };
    const pull = () => {
      raf = 0;
      const el = active;
      const e = last;
      if (!el || !e) return;
      // A stateful button that started working stops being magnetic: it lets go at once.
      if (!el.dataset.magnetic) return release(el);
      const [strength, follow] = el.dataset.magnetic.split(" ").map(Number);
      const r = el.getBoundingClientRect();
      // -1 at the left / top edge to 1 at the right / bottom, as the reference: (position / size − 0.5) × strength.
      const tx = ((e.clientX - r.left) / r.width - 0.5) * 2 * strength;
      const ty = ((e.clientY - r.top) / r.height - 0.5) * 2 * strength;
      el.style.setProperty("--tx", `${tx}px`);
      el.style.setProperty("--ty", `${ty}px`);
      el.style.setProperty("--lx", `${tx * follow}px`);
      el.style.setProperty("--ly", `${ty * follow}px`);
      el.dataset.tracking = "";
    };

    // The fill's resting place comes from CSS (above the button, or over it while hot); these animate between them.
    const fillIn = (el: HTMLElement) => {
      el.dataset.hot = "";
      const fill = el.querySelector<HTMLElement>(":scope > .btn-fill");
      if (!fill || reduced()) return;
      fill.getAnimations().forEach((a) => a.cancel());
      fill.animate([{ translate: "0 76%" }, { translate: "0 0" }], { duration: fillMs(el), easing: FILL_EASE });
    };
    const fillOut = (el: HTMLElement) => {
      const fill = el.querySelector<HTMLElement>(":scope > .btn-fill");
      const from = fill && getComputedStyle(fill).translate;
      delete el.dataset.hot;
      if (!fill || reduced()) return;
      fill.getAnimations().forEach((a) => a.cancel());
      const to = getComputedStyle(fill).translate;
      // Out through the top, unless a busy main button keeps it filled.
      if (from !== to)
        fill.animate([{ translate: from ?? "0 0" }, { translate: to }], { duration: fillMs(el), easing: FILL_EASE });
    };

    const leave = (el: HTMLElement) => {
      if (el.dataset.hot !== undefined) fillOut(el);
      if (active === el) {
        active = null;
        release(el);
      }
    };

    // Delegated enter / leave: the button under the pointer, ignoring moves between its own children.
    const buttonOf = (e: PointerEvent) =>
      e.pointerType === "mouse" ? (e.target as Element | null)?.closest?.<HTMLElement>(".btn") : null;
    const over = (e: PointerEvent) => {
      const el = buttonOf(e);
      if (!el || el.contains(e.relatedTarget as Node | null)) return;
      // A locked stateful button (working, done or failed) takes no hover.
      if (el.getAttribute("aria-disabled") === "true") return;
      if (el.dataset.fill) fillIn(el);
      if (el.dataset.magnetic && !reduced()) active = el;
    };
    const out = (e: PointerEvent) => {
      const el = buttonOf(e);
      if (!el || el.contains(e.relatedTarget as Node | null)) return;
      leave(el);
    };
    const move = (e: PointerEvent) => {
      if (!active) return;
      last = e;
      raf ||= requestAnimationFrame(pull);
    };
    const blur = () =>
      document.querySelectorAll<HTMLElement>(".btn[data-hot], .btn[data-tracking]").forEach((el) => {
        leave(el);
        release(el);
      });

    // A stateful button changing state moves its fill to where buttons.css now puts it, smoothly: locking (the click)
    // sends a raised fill out through the top, and the busy main button's fill rises away when it's done. If the
    // fill was mid-way (still rising), it carries on from there.
    const settle = (el: HTMLElement, oldStatus: string | null) => {
      const fill = el.querySelector<HTMLElement>(":scope > .btn-fill");
      const locked = el.getAttribute("aria-disabled") === "true";
      if (!fill) return;
      const moving = fill.getAnimations().some((a) => a.playState === "running");
      const covering =
        moving ||
        el.dataset.hot !== undefined ||
        el.matches(":focus-visible") ||
        (el.dataset.kind === "primary" && oldStatus === "loading");
      const from = moving ? getComputedStyle(fill).translate : "0px 0px";
      if (locked) delete el.dataset.hot;
      fill.getAnimations().forEach((a) => a.cancel());
      const to = getComputedStyle(fill).translate;
      if (!covering || reduced() || to === "none" || from === to) return;
      fill.animate([{ translate: from }, { translate: to }], { duration: fillMs(el), easing: FILL_EASE });
    };
    const states = new MutationObserver((records) => {
      const seen = new Map<HTMLElement, string | null>();
      for (const r of records) {
        const el = r.target as HTMLElement;
        if (!el.classList.contains("btn")) continue;
        if (!seen.has(el) || r.attributeName === "data-status")
          seen.set(el, r.attributeName === "data-status" ? r.oldValue : (seen.get(el) ?? null));
      }
      seen.forEach((old, el) => settle(el, old));
    });
    states.observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ["aria-disabled", "data-status"],
      attributeOldValue: true,
    });

    document.addEventListener("pointerover", over, { passive: true });
    document.addEventListener("pointerout", out, { passive: true });
    document.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("blur", blur);
    return () => {
      states.disconnect();
      cancelAnimationFrame(raf);
      document.removeEventListener("pointerover", over);
      document.removeEventListener("pointerout", out);
      document.removeEventListener("pointermove", move);
      window.removeEventListener("blur", blur);
      blur();
    };
  }, []);
  return null;
}

/**
 * Shared Button Style Utilities — Alti Code Studio v3.1.0
 *
 * Use these as the canonical button variants across all pages.
 * Pass via `className` prop:
 *
 * @example
 * import { btn } from "@/lib/buttonStyles";
 * <Button className={btn.primary}>Save</Button>
 * <Button className={btn.danger}>Delete</Button>
 */

/** Gradient primary action button — use for the main CTA on each page */
export const btnPrimary =
  "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold shadow-lg shadow-violet-500/20 hover:opacity-90 transition-opacity";

/** Soft destructive button — for uninstall, delete, revoke */
export const btnDanger =
  "bg-danger/15 border border-danger/30 text-danger hover:bg-danger/25 transition-colors font-semibold";

/** Muted secondary action */
export const btnSecondary =
  "bg-white/5 border border-white/10 text-default-300 hover:bg-white/10 hover:text-white transition-all font-medium";

/** Ghost / text-only link-style button */
export const btnGhost =
  "bg-transparent text-default-400 hover:text-white hover:bg-white/5 transition-colors";

/** Icon-only button (square, no padding) */
export const btnIcon =
  "bg-white/5 border border-white/10 text-default-400 hover:bg-white/15 hover:text-white transition-all rounded-xl";

/** Convenience map — use `btn.primary`, `btn.danger`, etc. */
export const btn = {
  primary: btnPrimary,
  danger: btnDanger,
  secondary: btnSecondary,
  ghost: btnGhost,
  icon: btnIcon,
} as const;

export type BtnVariant = keyof typeof btn;

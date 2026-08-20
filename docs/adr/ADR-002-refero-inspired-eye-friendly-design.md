# ADR-002: Refero-inspired, eye-friendly product visual system

**Status:** Accepted
**Date:** 2026-08-20
**Deciders:** Product owner and Codex

## Context

StackBridge had a strong editorial foundation, but the dashboard mixed several visual languages: sharp form controls, decorative labels, heavy shadows, angled cards, and rounded panels. The result was distinctive but less cohesive than the calm research-console experience the product is intended to provide.

Refero’s current interface is a useful reference for the opposite qualities: a quiet neutral canvas, large editorial headlines, soft gray/lavender surfaces, rounded controls, hairline borders, and restrained elevation. StackBridge is a long-session learning product, so a direct copy of Refero’s white/black contrast and saturated visual accents would not be appropriate.

## Decision

Adopt the transferable interaction and layout principles from [Refero](https://refero.design/) without copying its proprietary fonts, assets, screenshots, or exact interface:

- Use a warm off-white canvas instead of pure white.
- Use deep teal as the product anchor, with terracotta and gold as focused accents.
- Use very light surface changes and hairline borders to separate content.
- Use rounded controls and status chips for clear affordance.
- Use subtle elevation rather than large shadows.
- Keep the editorial serif for major learning moments and the existing sans-serif for readable body copy.
- Reduce ornamental transforms and remove unnecessary card rotation.
- Respect `prefers-reduced-motion` for study sessions and accessibility.
- Keep a dark theme with equivalent semantic contrast rather than inverting the interface to pure black and white.

## Assessment

| Area | Previous StackBridge tendency | Updated direction |
| --- | --- | --- |
| Canvas | Warm paper with several gradients | Warm paper with quieter surfaces |
| Controls | Small squared buttons and underlined fields | Rounded buttons, chips, and softly contained fields |
| Cards | Mixed flat panels, shadows, and angled surfaces | Consistent 20–24px surfaces with low elevation |
| Navigation | Dark sidebar with decorative geometry | Dark sidebar retained as brand anchor; interactions simplified |
| Typography | Editorial type mixed with frequent monospace labels | Serif reserved for hierarchy; sans-serif labels for product clarity |
| Motion | Lift and rotation used in several places | Short, low-amplitude feedback; reduced-motion fallback |
| Accessibility | Good warm contrast, but some small labels were dense | Preserve warm contrast and increase control clarity without brightening the canvas |

## Consequences

The product feels closer to a focused design-research tool while remaining recognizable as StackBridge. The system is easier to extend because new path cards, resource rows, status chips, and forms inherit the same surface and radius language.

The product deliberately does not use Refero’s proprietary font files or visual assets. If the palette needs to become even softer, the surface tokens can be adjusted centrally in `styles/stackbridge-system.css` without rewriting components.

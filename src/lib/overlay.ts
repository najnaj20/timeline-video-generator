import type { RenderSize } from './types';

export const OVERLAY_DESIGN_EDGE = 720;
export const OVERLAY_BOTTOM = 132;
export const CARD_TOP = 28;
export const CARD_SIDE_INSET = 34;
export const MAX_CARD_WIDTH = OVERLAY_DESIGN_EDGE - CARD_SIDE_INSET * 2;

export interface OverlayCard {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  centerX: number;
}

/** Overlay units are authored on a 720 by 720 design grid and scale with the short edge. */
export function overlayScale(size: RenderSize): number {
  return Math.min(size.width, size.height) / OVERLAY_DESIGN_EDGE;
}

export function overlayCard(size: RenderSize): OverlayCard {
  const scale = overlayScale(size);
  const width = Math.min(size.width - CARD_SIDE_INSET * 2 * scale, MAX_CARD_WIDTH * scale);
  const left = (size.width - width) / 2;
  return {
    left,
    top: CARD_TOP * scale,
    right: left + width,
    bottom: OVERLAY_BOTTOM * scale,
    width,
    centerX: left + width / 2,
  };
}

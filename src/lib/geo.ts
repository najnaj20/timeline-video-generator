import type { GeoPoint, Viewport, WorldPoint } from './types';

export function project(latitude: number, longitude: number): WorldPoint {
  const lat = Math.max(-85.05112878, Math.min(85.05112878, latitude));
  const sinLat = Math.sin((lat * Math.PI) / 180);
  return {
    x: (longitude + 180) / 360,
    y: Math.max(0, Math.min(1, 0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI))),
  };
}

export function unwrapWorldPoints(points: WorldPoint[]): WorldPoint[] {
  if (points.length === 0) return [];
  const output = [{ ...points[0] }];
  for (let index = 1; index < points.length; index += 1) {
    let x = points[index].x;
    const previousX = output[index - 1].x;
    while (x - previousX > 0.5) x -= 1;
    while (x - previousX < -0.5) x += 1;
    output.push({ x, y: points[index].y });
  }
  return output;
}

function wrapNear(value: number, reference: number): number {
  return value - Math.floor(value - reference + 0.5);
}

const POLAR_CORE_LATITUDE = 70;
const POLAR_CORRIDOR_LATITUDE = 50;

function greatCircleReferenceX(start: GeoPoint, end: GeoPoint, fraction: number): number {
  const toVector = (point: GeoPoint): [number, number, number] => {
    const latitude = (point.latitude * Math.PI) / 180;
    const longitude = (point.longitude * Math.PI) / 180;
    const latitudeRadius = Math.cos(latitude);
    return [
      latitudeRadius * Math.cos(longitude),
      latitudeRadius * Math.sin(longitude),
      Math.sin(latitude),
    ];
  };
  const from = toVector(start);
  const to = toVector(end);
  const dot = Math.max(-1, Math.min(1, from[0] * to[0] + from[1] * to[1] + from[2] * to[2]));
  const angle = Math.acos(dot);
  const sinAngle = Math.sin(angle);
  if (sinAngle < 1e-9) {
    return project(
      start.latitude + (end.latitude - start.latitude) * fraction,
      start.longitude + (end.longitude - start.longitude) * fraction,
    ).x;
  }
  const fromWeight = Math.sin((1 - fraction) * angle) / sinAngle;
  const toWeight = Math.sin(fraction * angle) / sinAngle;
  const x = from[0] * fromWeight + to[0] * toWeight;
  const y = from[1] * fromWeight + to[1] * toWeight;
  return (Math.atan2(y, x) / Math.PI + 1) / 2;
}

/**
 * Keeps polar flight corridors on the world-copy branch selected by their
 * stable endpoints. Longitude changes rapidly near a pole, so greedily
 * unwrapping every polar point can invent a complete extra turn around the map.
 */
export function unwrapJourneyPoints(points: GeoPoint[]): WorldPoint[] {
  const projected = points.map((point) => project(point.latitude, point.longitude));
  const output = unwrapWorldPoints(projected);
  let coreIndex = 1;
  while (coreIndex < points.length - 1) {
    if (Math.abs(points[coreIndex].latitude) < POLAR_CORE_LATITUDE) {
      coreIndex += 1;
      continue;
    }

    let corridorStart = coreIndex;
    while (
      corridorStart > 1
      && Math.abs(points[corridorStart - 1].latitude) >= POLAR_CORRIDOR_LATITUDE
    ) corridorStart -= 1;
    let corridorEnd = coreIndex;
    while (
      corridorEnd < points.length - 2
      && Math.abs(points[corridorEnd + 1].latitude) >= POLAR_CORRIDOR_LATITUDE
    ) corridorEnd += 1;

    const startAnchor = corridorStart - 1;
    const endAnchor = corridorEnd + 1;
    const startX = output[startAnchor].x;
    const intendedEndX = wrapNear(projected[endAnchor].x, startX);
    const branchCorrection = intendedEndX - output[endAnchor].x;
    if (Math.abs(branchCorrection) >= 0.5) {
      for (let index = corridorStart; index < endAnchor; index += 1) {
        const fraction = (index - startAnchor) / (endAnchor - startAnchor);
        const expectedX = startX + (intendedEndX - startX) * fraction;
        output[index].x = wrapNear(
          greatCircleReferenceX(points[startAnchor], points[endAnchor], fraction),
          expectedX,
        );
      }
      for (let index = endAnchor; index < output.length; index += 1) {
        output[index].x += branchCorrection;
      }
    }
    coreIndex = corridorEnd + 1;
  }
  return output;
}

export function overviewRouteSegments(points: WorldPoint[]): WorldPoint[][] {
  if (points.length === 0) return [];
  const { minX, maxX } = worldBounds(points);
  // A route that already fits inside a single world copy needs no split, so the wrap
  // window is centred on it and every point stays where unwrapJourneyPoints put it.
  // Anchoring the window on the last point instead would push a route such as
  // Seoul to Paris to New York across the window edge and report a full world width
  // to overviewViewport, which a non-square canvas can no longer fit. Routes that do
  // span more than one copy still collapse around the final camera position, so
  // blendViewport unwraps the ending viewport onto the same copy as the stroke.
  const referenceX = maxX - minX < 1 ? (minX + maxX) / 2 : (points.at(-1)?.x ?? 0.5);
  const lowerEdge = referenceX - 0.5;
  const upperEdge = referenceX + 0.5;
  const wrapped = points.map((point) => ({ x: wrapNear(point.x, referenceX), y: point.y }));
  const segments: WorldPoint[][] = [[wrapped[0]]];
  for (let index = 1; index < wrapped.length; index += 1) {
    const previous = wrapped[index - 1];
    const current = wrapped[index];
    const active = segments.at(-1)!;
    const delta = current.x - previous.x;
    if (Math.abs(delta) <= 0.5) {
      active.push(current);
      continue;
    }

    const crossingRight = delta < -0.5;
    const adjustedCurrentX = current.x + (crossingRight ? 1 : -1);
    const exitX = crossingRight ? upperEdge : lowerEdge;
    const enterX = crossingRight ? lowerEdge : upperEdge;
    const fraction = (exitX - previous.x) / (adjustedCurrentX - previous.x);
    const crossingY = previous.y + (current.y - previous.y) * fraction;
    active.push({ x: exitX, y: crossingY });
    segments.push([{ x: enterX, y: crossingY }, current]);
  }
  return segments;
}

export function worldBounds(points: WorldPoint[]): {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
} {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const point of points) {
    if (point.x < minX) minX = point.x;
    if (point.x > maxX) maxX = point.x;
    if (point.y < minY) minY = point.y;
    if (point.y > maxY) maxY = point.y;
  }
  return { minX, maxX, minY, maxY };
}

/** Square fit-to-bounds helper. Not aspect aware; the render path uses overviewViewport. */
export function viewportFor(points: WorldPoint[], size: number): Viewport {
  const {
    minX: minPointX,
    maxX: maxPointX,
    minY: minPointY,
    maxY: maxPointY,
  } = worldBounds(points);
  const centerX = (minPointX + maxPointX) / 2;
  const centerY = (minPointY + maxPointY) / 2;
  const span = Math.max(maxPointX - minPointX, maxPointY - minPointY, 0.002) * 1.28;
  const zoom = Math.max(2, Math.min(15, Math.floor(Math.log2(size / (256 * span)))));
  return {
    minX: centerX - span / 2,
    maxX: centerX + span / 2,
    minY: Math.max(0, centerY - span / 2),
    maxY: Math.min(1, centerY + span / 2),
    zoom,
  };
}

export function haversineKm(a: GeoPoint, b: GeoPoint): number {
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const dLat = lat2 - lat1;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 6371.0088 * 2 * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function cumulativeDistances(points: GeoPoint[]): number[] {
  const distances = new Array<number>(points.length).fill(0);
  for (let index = 1; index < points.length; index += 1) {
    distances[index] = distances[index - 1] + haversineKm(points[index - 1], points[index]);
  }
  return distances;
}

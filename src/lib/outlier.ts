import { haversineKm } from './geo';
import type { GeoPoint } from './types';

export type LocationFilterMode = 'conservative' | 'off';

export interface LocationFilterResult<T extends GeoPoint = GeoPoint> {
  points: T[];
  removedCount: number;
}

const MAX_OUTLIER_RUN_POINTS = 3;
const MIN_OUTLIER_HOP_KM = 500;
const MAX_REJOIN_DISTANCE_KM = 200;
const MAX_OUTLIER_CLUSTER_SPAN_KM = 200;
const MAX_PLAUSIBLE_SPEED_KMH = 1_300;
const MAX_EXCURSION_MS = 12 * 60 * 60 * 1000;

function speedKmPerHour(from: GeoPoint, to: GeoPoint, distanceKm: number): number {
  const millis = to.instant.getTime() - from.instant.getTime();
  if (millis <= 0) return Number.POSITIVE_INFINITY;
  return distanceKm / (millis / 3_600_000);
}

function isSuspiciousExcursion<T extends GeoPoint>(
  before: T,
  points: T[],
  start: number,
  end: number,
  after: T,
): boolean {
  const windowMs = after.instant.getTime() - before.instant.getTime();
  if (windowMs < 0 || windowMs > MAX_EXCURSION_MS) return false;
  if (haversineKm(before, after) > MAX_REJOIN_DISTANCE_KM) return false;

  const first = points[start];
  const last = points[end];
  const ingressKm = haversineKm(before, first);
  const egressKm = haversineKm(last, after);
  if (ingressKm < MIN_OUTLIER_HOP_KM || egressKm < MIN_OUTLIER_HOP_KM) return false;
  if (speedKmPerHour(before, first, ingressKm) <= MAX_PLAUSIBLE_SPEED_KMH) return false;
  if (speedKmPerHour(last, after, egressKm) <= MAX_PLAUSIBLE_SPEED_KMH) return false;

  for (let index = start; index <= end; index += 1) {
    const candidate = points[index];
    if (haversineKm(first, candidate) > MAX_OUTLIER_CLUSTER_SPAN_KM) return false;
    if (
      haversineKm(before, candidate) < MIN_OUTLIER_HOP_KM
      || haversineKm(candidate, after) < MIN_OUTLIER_HOP_KM
    ) return false;
  }
  return true;
}

function suspiciousRunEnd<T extends GeoPoint>(points: T[], before: T, start: number): number | null {
  const latestEnd = Math.min(start + MAX_OUTLIER_RUN_POINTS - 1, points.length - 2);
  for (let end = latestEnd; end >= start; end -= 1) {
    if (isSuspiciousExcursion(before, points, start, end, points[end + 1])) return end;
  }
  return null;
}

export function filterLocationOutliers<T extends GeoPoint>(
  points: T[],
  mode: LocationFilterMode = 'conservative',
): LocationFilterResult<T> {
  if (mode === 'off' || points.length < 3) return { points, removedCount: 0 };

  const kept: T[] = [points[0]];
  let removedCount = 0;
  let index = 1;
  while (index < points.length - 1) {
    const runEnd = suspiciousRunEnd(points, kept[kept.length - 1], index);
    if (runEnd === null) {
      kept.push(points[index]);
      index += 1;
    } else {
      removedCount += runEnd - index + 1;
      index = runEnd + 1;
    }
  }
  kept.push(points[points.length - 1]);
  return { points: kept, removedCount };
}

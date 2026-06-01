/**
 * Calibrated percentages for `/images/vietnam-map.png` (portrait S-shape).
 * Anchors tuned so Da Nang HQ (16.0544, 108.2022) aligns with the coast on the artwork.
 */
const ANCHORS = {
  hanoi: { lat: 21.0285, lng: 105.8542, left: 50, top: 16 },
  danang: { lat: 16.0544, lng: 108.2022, left: 57.5, top: 49 },
  hcmc: { lat: 10.8231, lng: 106.6297, left: 53, top: 80 },
} as const;

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Map WGS84 coordinates to marker position on the Vietnam illustration. */
export function toVietnamMapPosition(latitude: number, longitude: number): { left: string; top: string } {
  const { hanoi, danang, hcmc } = ANCHORS;

  let left: number;
  let top: number;

  if (latitude >= danang.lat) {
    const t = (hanoi.lat - latitude) / (hanoi.lat - danang.lat);
    top = lerp(hanoi.top, danang.top, Math.min(1, Math.max(0, t)));
    left = lerp(hanoi.left, danang.left, Math.min(1, Math.max(0, t)));
  } else {
    const t = (danang.lat - latitude) / (danang.lat - hcmc.lat);
    top = lerp(danang.top, hcmc.top, Math.min(1, Math.max(0, t)));
    left = lerp(danang.left, hcmc.left, Math.min(1, Math.max(0, t)));
  }

  const lngT = (longitude - 105.5) / (108.5 - 105.5);
  left += (lngT - 0.5) * 4;

  return {
    left: `${Math.min(68, Math.max(42, left)).toFixed(2)}%`,
    top: `${Math.min(84, Math.max(12, top)).toFixed(2)}%`,
  };
}

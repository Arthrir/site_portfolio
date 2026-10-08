export type Pt = { x: number; y: number };

/** Centripetal-ish uniform Catmull-Rom through closed control points, resampled at uniform arc length. */
export function buildTrack(cp: [number, number][], step = 4): Pt[] {
  const dense: Pt[] = [];
  const n = cp.length;
  const seg = 40;
  for (let i = 0; i < n; i++) {
    const p0 = cp[(i - 1 + n) % n], p1 = cp[i], p2 = cp[(i + 1) % n], p3 = cp[(i + 2) % n];
    for (let s = 0; s < seg; s++) {
      const t = s / seg, t2 = t * t, t3 = t2 * t;
      const f = (k: 0 | 1) =>
        0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3);
      dense.push({ x: f(0), y: f(1) });
    }
  }
  // cumulative length
  const m = dense.length;
  const cum = [0];
  for (let i = 1; i <= m; i++) {
    const a = dense[i - 1], b = dense[i % m];
    cum.push(cum[i - 1] + Math.hypot(b.x - a.x, b.y - a.y));
  }
  const total = cum[m];
  const count = Math.max(8, Math.round(total / step));
  const ds = total / count;
  const out: Pt[] = [];
  let j = 0;
  for (let k = 0; k < count; k++) {
    const L = k * ds;
    while (cum[j + 1] < L) j++;
    const a = dense[j], b = dense[(j + 1) % m];
    const t = (L - cum[j]) / (cum[j + 1] - cum[j] || 1);
    out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
  }
  return out;
}

/** Unit normals (pointing to the right of travel direction in screen space). */
export function normals(pts: Pt[]): Pt[] {
  const n = pts.length;
  return pts.map((_, i) => {
    const a = pts[(i - 1 + n) % n], b = pts[(i + 1) % n];
    const dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1;
    return { x: -dy / l, y: dx / l };
  });
}

/** Signed curvature (1/px), positive = turning right on screen, smoothed. */
export function curvature(pts: Pt[], win = 4): number[] {
  const n = pts.length;
  const raw = pts.map((_, i) => {
    const a = pts[(i - 1 + n) % n], b = pts[i], c = pts[(i + 1) % n];
    let d = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(b.y - a.y, b.x - a.x);
    while (d < -Math.PI) d += Math.PI * 2;
    while (d > Math.PI) d -= Math.PI * 2;
    return d / (Math.hypot(c.x - a.x, c.y - a.y) / 2 || 1);
  });
  return raw.map((_, i) => {
    let s = 0;
    for (let k = -win; k <= win; k++) s += raw[(i + k + n) % n];
    return s / (win * 2 + 1);
  });
}

export type KerbRun = { start: number; len: number; side: 1 | -1 };

/** Contiguous corner runs above a curvature threshold. side = normal sign of the OUTSIDE of the turn. */
export function cornerRuns(curv: number[], threshold: number, minLen = 6): KerbRun[] {
  const n = curv.length;
  const on = curv.map((c) => Math.abs(c) > threshold);
  // find a start index that is off (or whole loop on — ignore)
  let s0 = on.findIndex((v) => !v);
  if (s0 < 0) return [];
  const runs: KerbRun[] = [];
  let i = 0;
  while (i < n) {
    const idx = (s0 + i) % n;
    if (!on[idx]) { i++; continue; }
    const start = idx;
    let len = 0;
    let sum = 0;
    // split if the turn direction flips (chicanes)
    const sign = Math.sign(curv[idx]);
    while (i < n && on[(s0 + i) % n] && Math.sign(curv[(s0 + i) % n]) === sign) {
      sum += curv[(s0 + i) % n];
      len++; i++;
    }
    if (len >= minLen) runs.push({ start, len, side: sum > 0 ? -1 : 1 });
  }
  return runs;
}

/** Interpolate the centreline at fractional index u (wrapping), offset along the normal. */
function offAt(pts: Pt[], nor: Pt[], u: number, off: number): Pt {
  const n = pts.length;
  const i0 = Math.floor(u), t = u - i0;
  const a = ((i0 % n) + n) % n, b = (a + 1) % n;
  const px = pts[a].x + (pts[b].x - pts[a].x) * t, py = pts[a].y + (pts[b].y - pts[a].y) * t;
  let nx = nor[a].x + (nor[b].x - nor[a].x) * t, ny = nor[a].y + (nor[b].y - nor[a].y) * t;
  const l = Math.hypot(nx, ny) || 1;
  nx /= l; ny /= l;
  return { x: px + nx * off, y: py + ny * off };
}

/**
 * Kerb strip over [inner, inner+width] on run.side. Stripes are laid out by arc length measured
 * along the kerb's own mid-line (not the centreline), all of identical length and width.
 * Ends are closed with solid rounded caps and a rounded outline; no alpha fade.
 */
export function drawKerb(
  g: CanvasRenderingContext2D,
  pts: Pt[],
  nor: Pt[],
  run: KerbRun,
  inner: number,
  width: number,
  stripe: number,
  colors: [string, string],
) {
  const sd = run.side, mid = (inner + width / 2) * sd;
  // arc length along the offset mid-line, sampled finely
  const sub = 4, N = run.len * sub;
  const us: number[] = [], cum: number[] = [0];
  let prev = offAt(pts, nor, run.start, mid);
  us.push(run.start);
  for (let k = 1; k <= N; k++) {
    const u = run.start + k / sub;
    const p = offAt(pts, nor, u, mid);
    cum.push(cum[k - 1] + Math.hypot(p.x - prev.x, p.y - prev.y));
    us.push(u);
    prev = p;
  }
  const total = cum[N];
  const count = Math.max(2, Math.round(total / stripe));
  const sl = total / count;
  const uAt = (s: number) => {
    let lo = 0, hi = N;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (cum[m] <= s) lo = m; else hi = m; }
    const t = (s - cum[lo]) / (cum[hi] - cum[lo] || 1);
    return us[lo] + (us[hi] - us[lo]) * t;
  };
  g.save();
  for (let c = 0; c < count; c++) {
    const u0 = uAt(c * sl), u1 = uAt((c + 1) * sl);
    const samples = [u0];
    for (let u = Math.floor(u0 * sub + 1) / sub; u < u1; u += 1 / sub) samples.push(u);
    samples.push(u1);
    g.fillStyle = colors[c % 2];
    g.beginPath();
    samples.forEach((u, k) => {
      const p = offAt(pts, nor, u, inner * sd);
      if (k === 0) g.moveTo(p.x, p.y); else g.lineTo(p.x, p.y);
    });
    for (let k = samples.length - 1; k >= 0; k--) {
      const p = offAt(pts, nor, samples[k], (inner + width) * sd);
      g.lineTo(p.x, p.y);
    }
    g.closePath();
    g.fill();
  }
  // rounded caps: semicircle of radius width/2 at each end, pointing outward along the mid-line
  const r = width / 2;
  const capArc = (u: number, dir: 1 | -1, fromInner: boolean) => {
    const C = offAt(pts, nor, u, mid);
    const Q = offAt(pts, nor, u + dir * 0.25, mid);
    const tx = Q.x - C.x, ty = Q.y - C.y;
    const P = offAt(pts, nor, u, (fromInner ? inner : inner + width) * sd);
    const a0 = Math.atan2(P.y - C.y, P.x - C.x);
    const cw = Math.cos(a0 + Math.PI / 2) * tx + Math.sin(a0 + Math.PI / 2) * ty > 0;
    return { C, a0, ccw: !cw };
  };
  const ends: [number, 1 | -1, string][] = [
    [run.start + run.len, 1, colors[(count - 1) % 2]],
    [run.start, -1, colors[0]],
  ];
  for (const [u, dir, col] of ends) {
    const { C, a0, ccw } = capArc(u, dir, true);
    g.fillStyle = col;
    g.beginPath();
    g.arc(C.x, C.y, r, a0, a0 + (ccw ? -Math.PI : Math.PI), ccw);
    g.closePath();
    g.fill();
  }
  // solid outline around the whole kerb including rounded ends
  g.beginPath();
  for (let k = 0; k <= N; k++) {
    const p = offAt(pts, nor, us[k], inner * sd);
    if (k === 0) g.moveTo(p.x, p.y); else g.lineTo(p.x, p.y);
  }
  {
    const { C, a0, ccw } = capArc(us[N], 1, true);
    g.arc(C.x, C.y, r, a0, a0 + (ccw ? -Math.PI : Math.PI), ccw);
  }
  for (let k = N; k >= 0; k--) {
    const p = offAt(pts, nor, us[k], (inner + width) * sd);
    g.lineTo(p.x, p.y);
  }
  {
    const { C, a0, ccw } = capArc(us[0], -1, false);
    g.arc(C.x, C.y, r, a0, a0 + (ccw ? -Math.PI : Math.PI), ccw);
  }
  g.closePath();
  g.globalAlpha = 1;
  g.lineWidth = Math.max(1, width * 0.12);
  g.lineJoin = 'round';
  g.strokeStyle = 'rgba(20,20,20,1)';
  g.stroke();
  g.restore();
}

/** Smooth band on run.side from `inner`, width swelling to `maxW` with smoothstep ends. Returns the path (not filled). */
export function bandPath(g: CanvasRenderingContext2D, pts: Pt[], nor: Pt[], run: KerbRun, inner: number, maxW: number) {
  const sd = run.side, sub = 2, N = run.len * sub;
  const w = (k: number) => {
    const t = Math.min(k, N - k) / (N * 0.3);
    const s = Math.min(1, t);
    return maxW * s * s * (3 - 2 * s);
  };
  g.beginPath();
  for (let k = 0; k <= N; k++) {
    const p = offAt(pts, nor, run.start + k / sub, (inner - 1) * sd);
    if (k === 0) g.moveTo(p.x, p.y); else g.lineTo(p.x, p.y);
  }
  for (let k = N; k >= 0; k--) {
    const p = offAt(pts, nor, run.start + k / sub, (inner + w(k)) * sd);
    g.lineTo(p.x, p.y);
  }
  g.closePath();
}

export function offsetPath(g: CanvasRenderingContext2D, pts: Pt[], nor: Pt[], off: number) {
  g.beginPath();
  pts.forEach((p, i) => {
    const x = p.x + nor[i].x * off, y = p.y + nor[i].y * off;
    if (i === 0) g.moveTo(x, y);
    else g.lineTo(x, y);
  });
  g.closePath();
}

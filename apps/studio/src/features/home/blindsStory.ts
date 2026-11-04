/** Scroll-driven, illustrative Venetian mechanism calibrated to living-room.webp (1085 × 884). */
export const PHOTO = { width: 1085, height: 884 } as const;
export const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
export function smooth01(n: number) {
  const t = clamp01(n);
  return t * t * (3 - 2 * t);
}
export function windowRect(width: number, height: number) {
  const s = Math.max(width / PHOTO.width, height / PHOTO.height);
  const offX = (width - PHOTO.width * s) * (width <= 700 ? .6 : .5);
  const offY = (height - PHOTO.height * s) * .5;
  return { left: offX + 493 * s, right: offX + 984 * s, top: offY + 90 * s, bottom: offY + 680 * s, s };
}

/** Render only slats and rails; photo and canvas use the identical cover coordinate system. */
export function paintReveal(ctx: CanvasRenderingContext2D, width: number, height: number, progress: number) {
  const frame = windowRect(width, height);
  const p = clamp01(progress);
  ctx.clearRect(0, 0, width, height);
  const x = frame.left + 3 * frame.s;
  const w = frame.right - frame.left - 6 * frame.s;
  const y0 = frame.top + 3 * frame.s;
  const y1 = frame.bottom - 4 * frame.s;
  const heightOfBlind = y1 - y0;
  if (w <= 0 || heightOfBlind <= 0) return;
  const tilt = smooth01((p - .12) / .28);
  const lift = smooth01((p - .37) / .54);
  const slats = Math.max(25, Math.ceil(heightOfBlind / (12.4 * frame.s)));
  const step = heightOfBlind / slats;
  const packed = 2.05 * frame.s;
  const bottomY = y1 - (heightOfBlind - packed * slats - 2 * frame.s) * lift;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y0, w, heightOfBlind);
  ctx.clip();
  ctx.fillStyle = 'rgba(27,24,19,.13)';
  ctx.fillRect(x, y0, 4 * frame.s, heightOfBlind);
  ctx.fillRect(x + w - 3 * frame.s, y0, 3 * frame.s, heightOfBlind);
  for (let i = 0; i < slats; i++) {
    const yy = Math.min(y0 + i * step, bottomY - (slats - i) * packed);
    if (!Number.isFinite(yy)) continue;
    const sh = Math.max(2.4 * frame.s, (9.9 - 6.7 * tilt) * frame.s);
    const fill = ctx.createLinearGradient(0, yy, 0, yy + sh);
    fill.addColorStop(0, '#f9f4e9');
    fill.addColorStop(.37, '#e7d8bf');
    fill.addColorStop(.76, '#c4b59c');
    fill.addColorStop(1, '#837867');
    ctx.save();
    ctx.globalAlpha = 1 - tilt * .08;
    ctx.shadowColor = 'rgba(28,23,16,.33)';
    ctx.shadowBlur = 2.8 * frame.s;
    ctx.shadowOffsetY = 1.6 * frame.s;
    ctx.fillStyle = fill;
    ctx.fillRect(x + 2 * frame.s, yy, w - 4 * frame.s, sh);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.strokeStyle = 'rgba(255,255,248,.6)';
    ctx.lineWidth = .5 * frame.s;
    ctx.beginPath();
    ctx.moveTo(x + 2 * frame.s, yy + .5 * frame.s);
    ctx.lineTo(x + w - 2 * frame.s, yy + .5 * frame.s);
    ctx.stroke();
    ctx.restore();
  }
  ctx.strokeStyle = 'rgba(86,74,61,.51)';
  ctx.lineWidth = 1.15 * frame.s;
  for (const fraction of [.26, .74]) {
    ctx.beginPath();
    ctx.moveTo(x + w * fraction, y0);
    ctx.lineTo(x + w * fraction, Math.min(bottomY, y1));
    ctx.stroke();
  }
  const railY = Math.max(y0 + 3 * frame.s, bottomY);
  ctx.fillStyle = '#b7aa99';
  ctx.fillRect(x, railY, w, 9 * frame.s);
  ctx.fillStyle = '#eee7db';
  ctx.fillRect(x, railY, w, 2.2 * frame.s);
  ctx.strokeStyle = 'rgba(54,46,39,.3)';
  ctx.lineWidth = frame.s;
  ctx.strokeRect(x, railY, w, 9 * frame.s);
  ctx.restore();
  const hh = 12 * frame.s;
  const headrail = ctx.createLinearGradient(0, y0 - hh, 0, y0 + 2 * frame.s);
  headrail.addColorStop(0, '#e5dcd0');
  headrail.addColorStop(1, '#978c7c');
  ctx.fillStyle = headrail;
  ctx.fillRect(x, y0 - hh, w, hh);
  ctx.fillStyle = 'rgba(255,255,250,.55)';
  ctx.fillRect(x, y0 - hh, w, 1.2 * frame.s);
}

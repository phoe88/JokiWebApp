/** Pure geometry for the hand-written SVG charts. */

/** A clean axis: a round step and the top of the scale it reaches. */
export function niceScale(maxValue, tickCount = 4) {
  if (!(maxValue > 0)) return { max: 1, ticks: [0, 1] };

  const rough = maxValue / tickCount;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const residual = rough / magnitude;
  const step = (residual <= 1 ? 1 : residual <= 2 ? 2 : residual <= 2.5 ? 2.5 : residual <= 5 ? 5 : 10) * magnitude;
  const max = Math.ceil(maxValue / step) * step;

  const ticks = [];
  for (let tick = 0; tick <= max + step / 2; tick += step) ticks.push(tick);
  return { max, ticks };
}

/**
 * Monotone cubic tangents (Fritsch-Carlson). The curve never overshoots a data
 * point, so smoothing can't invent a peak or a value below zero.
 */
function tangents(points) {
  const count = points.length;
  const slopes = [];
  for (let i = 0; i < count - 1; i += 1) {
    slopes.push((points[i + 1].y - points[i].y) / (points[i + 1].x - points[i].x));
  }

  const result = new Array(count).fill(0);
  result[0] = slopes[0];
  result[count - 1] = slopes[count - 2];

  for (let i = 1; i < count - 1; i += 1) {
    result[i] = slopes[i - 1] * slopes[i] <= 0 ? 0 : (slopes[i - 1] + slopes[i]) / 2;
  }

  for (let i = 0; i < count - 1; i += 1) {
    if (slopes[i] === 0) {
      result[i] = 0;
      result[i + 1] = 0;
      continue;
    }
    const a = result[i] / slopes[i];
    const b = result[i + 1] / slopes[i];
    const length = Math.hypot(a, b);
    if (length > 3) {
      result[i] = (3 * a * slopes[i]) / length;
      result[i + 1] = (3 * b * slopes[i]) / length;
    }
  }

  return result;
}

const round = (value) => Math.round(value * 100) / 100;

export function linePath(points) {
  if (points.length === 0) return '';
  if (points.length === 1) return `M${round(points[0].x)},${round(points[0].y)}`;

  const slopes = tangents(points);
  let path = `M${round(points[0].x)},${round(points[0].y)}`;

  for (let i = 0; i < points.length - 1; i += 1) {
    const from = points[i];
    const to = points[i + 1];
    const third = (to.x - from.x) / 3;
    path +=
      `C${round(from.x + third)},${round(from.y + slopes[i] * third)} ` +
      `${round(to.x - third)},${round(to.y - slopes[i + 1] * third)} ` +
      `${round(to.x)},${round(to.y)}`;
  }

  return path;
}

export function areaPath(points, baseline) {
  if (points.length < 2) return '';
  const last = points[points.length - 1];
  return `${linePath(points)}L${round(last.x)},${round(baseline)}L${round(points[0].x)},${round(baseline)}Z`;
}

/** A horizontal bar: square at the baseline, rounded at the data end. */
export function horizontalBarPath(width, height, radius = 4) {
  const r = Math.min(radius, width, height / 2);
  return `M0,0H${round(width - r)}Q${round(width)},0 ${round(width)},${round(r)}V${round(height - r)}Q${round(width)},${round(height)} ${round(width - r)},${round(height)}H0Z`;
}

/** Keeps a box of `size` inside [min, max], preferring `position`. */
export const clamp = (position, size, min, max) => Math.max(min, Math.min(position, max - size));

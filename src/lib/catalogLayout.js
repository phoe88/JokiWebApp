/**
 * Decides how many grid cells each visible service takes, so the grid ends on a
 * full row under any filter result. The first card is the featured one. Cards in
 * a short last row grow to close the gap instead of leaving a hole.
 *
 * Returns one { cols, rows, variant } per card, where variant is 'featured',
 * 'wide' or 'standard'.
 */
export function catalogLayout(count, columns) {
  if (count === 0) return [];

  const cards = Array.from({ length: count }, () => ({ cols: 1, rows: 1, variant: 'standard' }));
  if (columns === 1) {
    cards[0].variant = count === 1 ? 'wide' : 'featured';
    return cards;
  }

  const rest = count - 1;
  const lead = cards[0];

  if (rest === 0) return [{ cols: columns, rows: 1, variant: 'wide' }];

  lead.cols = rest < columns - 2 ? columns - rest : Math.min(2, columns);
  const sideSlots = columns - lead.cols;
  lead.rows = columns >= 3 && rest >= sideSlots * 2 ? 2 : 1;
  lead.variant = lead.rows === 2 ? 'featured' : 'wide';

  const leftover = (rest - sideSlots * lead.rows) % columns;
  if (rest >= sideSlots * lead.rows && leftover > 0) {
    let spare = columns - leftover;
    let offset = 0;
    while (spare > 0) {
      const card = cards[count - 1 - (offset % leftover)];
      card.cols += 1;
      spare -= 1;
      offset += 1;
    }
  }

  for (const card of cards.slice(1)) {
    if (card.cols > 1) card.variant = 'wide';
  }

  return cards;
}

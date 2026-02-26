export const estimateTransportCost = ({ quantity, distanceKm }) => {
  const qty = Number(quantity || 0);
  const distance = Number(distanceKm || 0);
  const base = 500;
  const perKm = 8 * distance;
  const perQty = 5 * qty;
  return Math.max(0, Math.round(base + perKm + perQty));
};

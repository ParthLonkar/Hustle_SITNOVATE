export const calculateProfit = ({ pricePerUnit, quantity, transportCost }) => {
  const price = Number(pricePerUnit || 0);
  const qty = Number(quantity || 0);
  const cost = Number(transportCost || 0);
  return Math.round(price * qty - cost);
};

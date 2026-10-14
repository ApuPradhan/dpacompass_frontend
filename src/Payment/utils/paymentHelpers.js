export const formatAmount = (amount) => {
  return `₹${Number(amount).toLocaleString("en-IN")}`;
};
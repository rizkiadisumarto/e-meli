// Format number with dot separator: 50000 -> "50.000"
export const formatNumberInput = (value) => {
  if (value === '' || value === null || value === undefined) return '';
  const num = String(value).replace(/[^0-9]/g, '');
  if (!num) return '';
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

// Parse formatted string back to number: "50.000" -> 50000
export const parseNumberInput = (value) => {
  if (!value) return 0;
  const cleaned = String(value).replace(/\./g, '');
  return Number(cleaned) || 0;
};

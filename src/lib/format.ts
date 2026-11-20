export const formatINR = (val: number, decimals: number = 2): string => {
  if (isNaN(val) || !isFinite(val)) return '₹0.00';
  return '₹' + val.toLocaleString('en-IN', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals === 0 ? 0 : 2,
  });
};

export const formatPercent = (val: number, decimals: number = 2): string => {
  if (isNaN(val) || !isFinite(val)) return '0.00%';
  return (val * 100).toFixed(decimals) + '%';
};

export const formatNumber = (val: number, decimals: number = 2): string => {
  if (isNaN(val) || !isFinite(val)) return '0';
  return val.toLocaleString('en-IN', { maximumFractionDigits: decimals });
};

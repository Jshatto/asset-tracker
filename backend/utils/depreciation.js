function calculateStraightLineDepreciation(asset) {
  const cost = parseFloat(asset.cost);
  const usefulLife = parseInt(asset.useful_life);
  const start = new Date(asset.depreciation_start);
  const today = new Date();

  const monthsInService =
    (today.getFullYear() - start.getFullYear()) * 12 +
    (today.getMonth() - start.getMonth());

  const monthlyDepreciation = cost / (usefulLife * 12);
  const accumulated = Math.min(monthsInService * monthlyDepreciation, cost);

  return accumulated.toFixed(2);
}

module.exports = { calculateStraightLineDepreciation };

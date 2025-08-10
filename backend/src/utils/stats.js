function mean(arr, accessor = x => x) {
  if (!Array.isArray(arr) || arr.length === 0) return 0;
  return arr.reduce((sum, item) => sum + accessor(item), 0) / arr.length;
}

module.exports = { mean };
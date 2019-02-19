export function linear (attempt, interval, max = Infinity) {
  return Math.min(interval * attempt, max)
}

export function exponential (factor, attempt, min = 1, max = Infinity) {
  return Math.min(Math.pow(factor, attempt) * min, max)
}

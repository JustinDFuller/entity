export function Boolean(value = false) {
  return {
    toJSON() {
      return value
    },
    toString() {
      return String(value)
    },
  }
}

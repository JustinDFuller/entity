export function String(value = "") {
  return {
    toJSON() {
      return value
    },
    toString() {
      return value
    },
  }
}

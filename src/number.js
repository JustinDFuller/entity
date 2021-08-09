export function Number(value = 0) {
  return {
    toJSON() {
      return value
    },
    toString() {
      return value
    },
  }
}

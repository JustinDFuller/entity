export function Time(time) {
  return {
    toJSON() {
      return time
    },
    toString() {
      return time.toString()
    },
  }
}

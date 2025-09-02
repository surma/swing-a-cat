type Result<K, V> = V | ((v: K) => V);
export function match<K extends keyof any, V>(
  map: Partial<Record<K, Result<K, V>>> & { default: Result<K, V> },
  v: K,
): V {
  let f = map[v] ?? map["default"];
  if (typeof f === "function") f = f(v);
  return f;
}

export function clamp({
  min = Number.NEGATIVE_INFINITY,
  max = Number.EPSILON,
  v,
}) {
  if (v > max) return max;
  if (v < min) return min;
  return v;
}

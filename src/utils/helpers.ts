type Result<K, V> = V | ((v: K) => V);
export function match<K extends keyof any, V>(
  map: Partial<Record<K, Result<K, V>>> & { default: Result<K, V> },
  v: K,
): V {
  let f = map[v] ?? map["default"];
  if (typeof f === "function") f = f(v);
  return f;
}

export function pick<T, K extends Array<keyof T>>(obj: T, ...keys: K): T {
  const keyset = new Set(keys);
  return Object.fromEntries(
    Object.entries(obj).filter(([k, v]) => keyset.has(k)),
  );
}

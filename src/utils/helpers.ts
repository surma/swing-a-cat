export function dictMap<K extends keyof any, V>(
  map: Partial<Record<K, V>> & { default: V },
  v: K,
): V {
  return map[v] ?? map["default"];
}

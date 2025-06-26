export type Maybe<T> = T | null | undefined;

export function must<T>(v: Maybe<T>, msg?: string): T {
  if (!v) throw Error(msg ?? "Assertion failed");
  return v;
}

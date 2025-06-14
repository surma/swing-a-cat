import * as e from "littlejsengine";

export function hexColor(s: string): e.Color {
  return new e.Color(
    ...s
      .slice(1)
      .split(/(..)/)
      .filter(Boolean)
      .map((v) => parseInt(v, 16) / 255),
  );
}

import { expect, test } from "vitest";
import { hexColor } from "./color";
import * as e from "littlejsengine";

interface TableTestEntry {
  input: string;
  output: e.Color;
}
const table: TableTestEntry[] = [{ input: "#FF0000", output: e.rgb(1, 0, 0) }];

for (const { input, output } of table) {
  test(`${input} == ${JSON.stringify(output)}?`, () => {
    const c = hexColor(input);
    for (const k of Object.keys(output)) {
      // @ts-ignore
      expect(c[k]).toBe(output[k]);
    }
  });
}

import { expect, test } from "vitest";
import { remap } from "./helpers";

interface TableTestEntry {
  input: any;
  output: number;
}
const table: TableTestEntry[] = [
  ...[
    [3, 7],
    [2, 5],
    [4, 9],
    [0, 5],
    [-1, 5],
    [100, 9],
  ].map(([v, output]) => ({
    input: {
      vin: { min: 2, max: 4 },
      vout: { min: 5, max: 9 },
      v,
    },
    output,
  })),
  {
    input: {
      vin: { min: 4, max: 4 },
      vout: { min: 5, max: 9 },
      v: 4,
    },
    output: 5,
  },
];

for (const { input, output } of table) {
  test(`${JSON.stringify(input)} == ${JSON.stringify(output)}?`, () => {
    const r = remap(input);
    expect(r).toBe(output);
  });
}

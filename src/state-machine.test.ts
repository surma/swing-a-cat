import { it, describe, expect } from "vitest";
import stateMachine from "./state-machine";

describe("State Machine", () => {
  it("should do state transitions", () => {
    const data = {} as any;
    const sm = stateMachine(
      {
        start: {
          update(data, action) {
            data.stay = 1;
            return "next";
          },
          exit(data, action) {
            data.stay_exit = 1;
          },
        },
        next: {
          enter(data, action) {
            data.next_enter = 1;
          },
          update(data, action) {
            data.next = (data.next ?? 0) + 1;
            return null;
          },
        },
      },
      data,
    );
    sm.action(null);
    expect(data).to.deep.equal({
      stay: 1,
      stay_exit: 1,
      next_enter: 1,
    });
    sm.action(null);
    expect(data).to.deep.equal({
      stay: 1,
      stay_exit: 1,
      next_enter: 1,
      next: 1,
    });
    sm.action(null);
    expect(data).to.deep.equal({
      stay: 1,
      stay_exit: 1,
      next_enter: 1,
      next: 2,
    });
  });
});

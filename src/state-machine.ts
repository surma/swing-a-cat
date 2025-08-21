import { Maybe } from "./utils/types";

type NextStateName<D, A> = Maybe<string> | void;

export type StateFunction<D, A> = (data: D, action: A) => NextStateName<D, A>;

export interface ExtendedState<D, A> {
  enter?(data: D, action: A): void;
  update(data: D, action: A): NextStateName<D, A>;
  exit?(data: D, action: A): void;
}

export type State<D, A> = ExtendedState<D, A>;

export type StateMachine<D, A> = Record<string, State<D, A>>;

export interface StateMachineInstance<D, A> {
  get currentState(): ExtendedState<D, A>;
  action(action: A): void;
}
export default function stateMachine<D, A>(
  desc: StateMachine<D, A>,
  data: D,
): StateMachineInstance<D, A> {
  let currentState = Object.values(desc)[0];

  return {
    get currentState() {
      return currentState;
    },
    action(action: A) {
      const nextStateName = currentState.update(data, action);
      if (!nextStateName) return;
      const nextState = desc[nextStateName];
      if (!nextState) throw Error(`Invalid state name ${nextStateName}`);
      currentState.exit?.(data, action);
      nextState.enter?.(data, action);
      currentState = nextState;
    },
  };
}

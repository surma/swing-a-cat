import { error } from "./utils/error";
import { Maybe } from "./utils/types";

type NextStateName<D, A, E> = Maybe<string> | void;

export type StateFunction<D, A, E = {}> = (
  data: D,
  action: A,
) => NextStateName<D, A, E>;

export interface StateCallbacks<D, A, E> {
  enter?(data: D, action: A): NextStateName<D, A, E>;
  update(data: D, action: A): NextStateName<D, A, E>;
  exit?(data: D, action: A): NextStateName<D, A, E>;
}

export type State<D, A, E> = StateCallbacks<D, A, E> & E;

export type StateMachine<D, A, E> = Record<string, State<D, A, E>>;

export interface StateMachineInstance<D, A, E = {}> {
  get currentState(): State<D, A, E>;
  action(action: A): void;
}
export default function stateMachine<D, A, E = {}>(
  desc: StateMachine<D, A, E>,
  data: D,
): StateMachineInstance<D, A, E> {
  let currentState = Object.values(desc)[0];

  function _handleNextState(nextStateName: NextStateName<D, A, E>, action: A) {
    if (!nextStateName) return;
    const nextState = desc[nextStateName];
    if (!nextState) error(`Invalid state name ${nextStateName}`);
    const exitOverride = currentState.exit?.(data, action);
    if (exitOverride) return _handleNextState(exitOverride, action);
    const enterOverride = nextState.enter?.(data, action);
    if (enterOverride) return _handleNextState(exitOverride, action);
    currentState = nextState;
  }

  return {
    get currentState() {
      return currentState;
    },
    action(action: A) {
      const nextStateName = currentState.update(data, action);
      _handleNextState(nextStateName, action);
    },
  };
}

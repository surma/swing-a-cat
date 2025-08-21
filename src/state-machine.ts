import { Maybe } from "./utils/types";

type NextStateName<D, A> = Maybe<string> | void;

export type StateFunction<D, A> = (data: D, action: A) => NextStateName<D, A>;

export interface ExtendedState<D, A> {
  enter?(data: D, action: A): NextStateName<D, A>;
  update(data: D, action: A): NextStateName<D, A>;
  exit?(data: D, action: A): NextStateName<D, A>;
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

  function _handleNextState(nextStateName: NextStateName<D, A>, action: A) {
    if (!nextStateName) return;
    const nextState = desc[nextStateName];
    if (!nextState) throw Error(`Invalid state name ${nextStateName}`);
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

import { Maybe } from "./utils/types";

type NextState<D, A> = Maybe<State<D, A>;

export type StateFunction<D, A> = (data: D, action: A) => NextState<D, A>;

export interface ExtendedState<D, A> {
	enter(data: D, action: A): void;
	stay(data: D, action: A): NextState<D,A>;
	exit(data: D, action: A): void;
}

export type State<D, A> = StateFunction<D, A> | ExtendedState<D,A>;

export type StateMachine<D, A> = Record<string, State<D, A>>;

export default function stateMachine<D, A>(desc: StateMachine<D, A>) {
	const currentState= Object.values(desc)[0];

	return {
		action(action: A) {
			
		}
	}
}

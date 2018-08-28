import { Task } from '@ts-task/task';

export const tapChain = <A, B, E> (fn: (x: A) => Task<B, E>) =>
	(x: A) =>
		fn(x)
			.map(_ => x)
;

export const tap = <A> (fn: (x: A) => any) =>
	(x: A)	=> {
		fn(x);
		return x;
	}
;

import { Task, UncaughtError } from '@ts-task/task';

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

export const limitConcurrency = <A, T, E> (maxConcurrentTasks: number, toTaskFn: (x: A) => Task<T, E>) =>
	function processTasks (input: A[]) {
		console.log(`Have to process ${input.length} tasks in chunks of ${maxConcurrentTasks}`);
		return new Task<T[], E | UncaughtError>((resolve, reject) => {
			Task
				.all(input
					.slice(0, maxConcurrentTasks)
					.map(toTaskFn)
				)
				.chain(previousResults =>
					input.length <= maxConcurrentTasks ?
						Task.resolve(previousResults) :
						processTasks(input.slice(maxConcurrentTasks))
							.map(tailResults => previousResults.concat(tailResults))
				)
				.fork(reject, resolve)
			;
		});
	}
;

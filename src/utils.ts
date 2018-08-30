import { Task, UncaughtError } from '@ts-task/task';
import { isInstanceOf } from '@ts-task/utils';
import { Overwrite } from 'type-zoo';

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

/**
 * Does nothing
 * @return undefined
 */
export const noop = () => undefined;

/**
 * Logs an error to the console
 * @param err 
 * @return undefined
 */
export const logUnhandledError = (err: Error) => {
	console.error('Unhandled error!', err);
};


/**
 * Takes a function that returns a sync result or throws an error and calls it from a
 * Task, handling the error if it is a TypeError, with the errHandler function
 * @param validation function that takes a parameter and returns a sync value or throws TypeError
 * @param errHandler function that takes a TypeError and returns another Error
 * @returns Task to the validation result, possible rejected with the results of the errHandler
 */
export const taskValidation = <A, B, E> (validation: (x: A) => B, errHandler: (err: TypeError) => E) =>
	(x: A): Task<B, E | UncaughtError> => {
		try {
			return Task.resolve(validation(x));
		}
		catch(err) {
			return Task
				.reject(isInstanceOf(TypeError)(err) ?
					errHandler(err) :
					new UncaughtError(err)
				)
		}
};

/**
 * Overwrite takes two objects and returns a new one, that is like the first one,
 * overwritten with the second one. Mantains prototype chain of the firs object (in the result).
 * @param target original object
 * @param source object with the properties to overwrite
 * @returns "merged" object
 */
export const overwrite = <A, B> (target: A, source: B) =>
	Object.assign(
		Object.create(target.constructor.prototype),
		target,
		source
	) as any as Overwrite<A, B>
;

/**
 * This function should never be called in runtime. If it is, it throws an Error.
 * Is useful for the type inference system to check its parameter is of type never.
 * @param x should be `never`
 */
export const assertNever = (x: never) => {
	throw new Error(`This should never be called, but was called with value ${x}`);
};

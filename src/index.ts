import { getQueryResults, getProductInformation } from './providers/easy.provider';
import { Task, UncaughtError } from '@ts-task/task';
import { share } from '@ts-task/utils';
import { closeBrowser } from './puppeteer-utils';
import { tapChain, tap } from './utils';

const limitConcurrency = <A, T, E> (maxConcurrentTasks: number, toTaskFn: (x: A) => Task<T, E>) =>
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

// TODO: try with "silla"
getQueryResults('heladera')
	.map(tap(x => console.log('Obtenidos los resultados!', x)))
	.pipe(share())
	.chain(limitConcurrency(3, getProductInformation))
	.map(tap(x => console.log('Products information', x)))
	.chain(tapChain(closeBrowser))
	.fork(
		err =>
			console.log('Hubo un error!', err),
		x =>
			console.log('Todo un éxito!', x)
	)
;

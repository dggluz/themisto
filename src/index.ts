import { getQueryResults } from './providers/easy.provider';

getQueryResults('silla')
	.fork(
		err =>
			console.log('Hubo un error!', err),
		x =>
			console.log('Todo un éxito!', x)
	)
;

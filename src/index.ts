import { getQueryResults, getProductInformation } from './providers/easy.provider';
import { closeBrowser } from './puppeteer-utils';
import { tapChain, tap, limitConcurrency } from './utils';

// TODO: try with "silla"
getQueryResults('heladera')
	.map(tap(x => console.log('Obtenidos los resultados!', x)))
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

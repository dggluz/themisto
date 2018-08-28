import { closeBrowser } from './puppeteer-utils';
import { tapChain } from './utils';
import { queryProductsAndGetInformation } from './providers/easy/easy.provider';

// TODO: try with "silla"
queryProductsAndGetInformation('heladera')
	.chain(tapChain(closeBrowser))
	.fork(
		err =>
			console.log('Hubo un error!', err),
		x =>
			console.log('Todo un éxito!', x)
	)
;

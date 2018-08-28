import { closeBrowser } from './puppeteer-utils';
import { tapChain } from './utils';
import { queryProductsAndGetInformation } from './providers/easy/easy.provider';

// TODO: add server and the crawler an endpoint (with authentication)
// TODO: add providers
// TODO: improve logging (use winston?)
// TODO: jsdocs
// TODO: read configs and secrets from files
// TODO: improve error handling
// TODO: add tslint
// TODO: add tests
// TODO: add README

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

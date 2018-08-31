// import { closeBrowser } from './puppeteer-utils';
// import { tapChain } from './utils';
// import { queryProductsAndGetInformation } from './providers/easy/easy.provider';
import { createServer } from './server-utils/create-server';
import { pingCtrl } from './controllers/ping.controller';
import { queryProductCtrl } from './controllers/query-product.controller';

// TODO: add providers
// TODO: improve logging (use winston?)
// TODO: jsdocs
// TODO: add tslint
// TODO: add tests
// TODO: add README

// queryProductsAndGetInformation('heladera')
// 	.chain(tapChain(closeBrowser))
// 	.fork(
// 		err =>
// 			console.log('Hubo un error!', err),
// 		x =>
// 			console.log('Todo un éxito!', x)
// 	)
// ;

createServer()
	.fork(console.log, server => {
		server.get('/ping', pingCtrl);
		server.post('/api/query-product', queryProductCtrl);
	})
;


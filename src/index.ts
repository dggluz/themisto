import { crawle } from './puppeteer-utils';

crawle('https://www.google.com', () => {
		return Promise.resolve(document.title);
	})
	.fork(
		err =>
			console.log('Hubo un error!', err),
		x =>
			console.log('Todo un éxito!', x)
	)
;

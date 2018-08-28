import { getQueryResults } from './query-search';
import { tap, limitConcurrency } from '../../utils';
import { getProductInformation } from './product-information';

export const queryProductsAndGetInformation = (term: string) =>
	getQueryResults(term)
		.map(tap(x => console.log('Obtenidos los resultados!', x)))
		.chain(limitConcurrency(7, getProductInformation))
		.map(tap(x => console.log('Products information', x)))
;

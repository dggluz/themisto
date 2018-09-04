import { getQueryResults } from './query-search';
import { tap, limitConcurrency } from '../../utils';
import { getProductInformation } from './product-information';

export const queryProductsAndGetInformation = (term: string) =>
	getQueryResults(term)
		.chain(limitConcurrency(7, getProductInformation))
;

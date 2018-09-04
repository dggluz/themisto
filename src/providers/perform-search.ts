import { assertNever } from '../utils';
import { queryProductsAndGetInformation } from './easy/easy.provider';
import { Provider } from './provider';

export interface Search {
	searchOrderId: string;
	query: string;
	provider: Provider;
	options: any;
}

export const performSearch = (search: Search) => {
	switch (search.provider) {
		case 'easy':
			return queryProductsAndGetInformation(search.query);
	}
	assertNever(search.provider);
};


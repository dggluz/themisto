import { assertNever } from '../utils';
import { queryProductsAndGetInformation } from './easy/easy.provider';

export interface Search {
	searchOrderId: string;
	query: string;
	provider: 'easy';
	options: any;
}

export const performSearch = (search: Search) => {
	switch (search.provider) {
		case 'easy':
			return queryProductsAndGetInformation(search.query);
	}
	assertNever(search.provider);
};


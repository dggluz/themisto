import { Search, performSearch } from './providers/perform-search';
import { Task } from '@ts-task/task';
import { sendSearchResults } from './send-search-results';
import { ProductInformation } from './providers/product-info';
import { noop } from './utils';
import { Provider } from './providers/provider';

// TODO: check Search typings

export interface SearchSuccessfulResult {
	searchOrderId: string;
	query: string;
	status: 'fulfilled';
	products: ProductInformation[];
	provider: Provider;
}

export interface SearchFailedResult {
	searchOrderId: string;
	query: string;
	status: 'failed';
	provider: Provider;
}

export type SearchResults = SearchSuccessfulResult | SearchFailedResult;

export class SearchQueue {
	private _pendingSearches: Search[] = [];
	private _performingSearch = false;

	addSearch (search: Search) {
		this._pendingSearches.push(search);
		this._performSearchIfIdle();
		return this;
	}

	private _performPendingSearch () {
		const pendingSearch = this._pendingSearches.shift();
		if (!pendingSearch) {
			// TODO: reify error
			throw new Error('There are no pending searches');
		}
		this._performingSearch = true;

		performSearch(pendingSearch)
			.map(productsInfo => ({
				searchOrderId: pendingSearch.searchOrderId,
				query: pendingSearch.query,
				status: 'fulfilled',
				products: productsInfo,
				provider: pendingSearch.provider
			} as SearchSuccessfulResult))
			.catch(err => {
				console.error(err);
				return Task.resolve({
					searchOrderId: pendingSearch.searchOrderId,
					query: pendingSearch.query,
					status: 'failed',
					provider: pendingSearch.provider
				} as SearchFailedResult);
			})
			.chain(sendSearchResults)
			.catch(err => {
				console.error(err);
				return Task.resolve(undefined);
			})
			.map(_ => {
				this._performingSearch = false;
				this._performSearchIfIdle();
			})
			.fork(console.error, noop)
		;

		return this;
	}

	private _performSearchIfIdle () {
		if (this._areAvailableSearches() && this._isIdle()) {
			this._performPendingSearch();
		}
		return this;
	}

	private _areAvailableSearches () {
		return this._pendingSearches.length > 0;
	}

	private _isIdle () {
		return !this._performingSearch;
	}
}

export const searchQueue = new SearchQueue();

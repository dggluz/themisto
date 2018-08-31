import { Search, performSearch } from './providers/perform-search';
import { Task } from '@ts-task/task';
import { sendSearchResults } from './send-search-results';
import { ProductInformation } from './providers/product-info';

// TODO: check Search typings

export interface SearchSuccessfulResult {
	searchOrderId: string;
	query: string;
	status: 'fulfilled';
	products: ProductInformation[];
}

export interface SearchFailedResult {
	searchOrderId: string;
	query: string;
	status: 'failed';
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

	_performPendingSearch () {
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
				products: productsInfo
			} as SearchSuccessfulResult))
			.catch(err => {
				console.error(err);
				return Task.resolve({
					searchOrderId: pendingSearch.searchOrderId,
					query: pendingSearch.query,
					status: 'failed'
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
		;

		return this;
	}

	_performSearchIfIdle () {
		if (this._areAvailableSearches() && this._isIdle()) {
			this._performPendingSearch();
		}
		return this;
	}

	_areAvailableSearches () {
		return this._pendingSearches.length > 0;
	}

	_isIdle () {
		return !this._performingSearch;
	}
}

export const searchQueue = new SearchQueue();

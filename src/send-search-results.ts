import { SearchResults } from './search-queue';
import { Task } from '@ts-task/task';
import { secrets } from './secrets';
import { configs } from './configs';
import { postRequest } from './make-request';

/**
 * Performs a request to ganymede to save the search results
 * @param searchResults 
 */
export const sendSearchResults = (searchResults: SearchResults) =>
	Task
	.all([secrets, configs])
	.chain(([secrets, configs]) =>
		postRequest<SearchResults>(
			configs.ganymede.searchResults.url, searchResults, {
				auth: secrets.auth.myself
			}
		)
	)	
;

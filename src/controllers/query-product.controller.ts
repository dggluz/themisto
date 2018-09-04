import { Task } from '@ts-task/task';
import { createEndpoint } from '../server-utils/create-endpoint';
import { checkBody } from '../middlewares/check-body.middleware';
import { objOf, str, oneOf, anything } from 'ts-dynamic-type-checker';
import { caseError } from '@ts-task/utils';
import { basicAuthMiddleware } from '../middlewares/basic-auth.middleware';
import { isJSONFileError } from '../fs-utils';
import { asUncaughtError } from '@ts-task/task/dist/lib/src/operators';
import { authorizationMiddleware } from '../middlewares/authorization.middleware';
import { tap } from '../utils';
import { searchQueue } from '../search-queue';
import { Provider } from '../providers/provider';

export interface SearchData {
	searchOrderId: string;
	query: string;
	provider: Provider;
	options: any;
}

export const queryProductCtrl = createEndpoint(req =>
	Task
		.resolve(req)
		.chain(basicAuthMiddleware)
		.chain(authorizationMiddleware('search-product'))
		.chain(checkBody(objOf<SearchData>({
			searchOrderId: str,
			query: str,
			provider: oneOf('easy'),
			// TODO: improve options typings (relate with the provider)
			options: anything
		})))
		.map(tap(req => searchQueue.addSearch(req.body)))
		.map(_ => ({
			status: 'ok'
		}))
		.catch(caseError(isJSONFileError, err => asUncaughtError(err)))
	)
;

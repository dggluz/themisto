import { Task, UncaughtError } from '@ts-task/task';
import { createEndpoint } from '../server-utils/create-endpoint';
import { checkBody } from '../middlewares/check-body.middleware';
import { objOf, str, oneOf, anything } from 'ts-dynamic-type-checker';
import { caseError, isInstanceOf } from '@ts-task/utils';
import { PuppeteerError } from '../puppeteer-utils';
import { basicAuthMiddleware } from '../middlewares/basic-auth.middleware';
import { isJSONFileError } from '../fs-utils';
import { asUncaughtError } from '@ts-task/task/dist/lib/src/operators';
import { authorizationMiddleware } from '../middlewares/authorization.middleware';

export interface SearchData {
	searchOrderId: string;
	query: string;
	provider: 'easy';
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
		// TODO: decouple search of products and respond to Ganymedes
		// TODO: manage puppeteer error
		.catch(caseError(isInstanceOf(PuppeteerError), err => Task.reject(new UncaughtError(err))))
		.catch(caseError(isJSONFileError, err => asUncaughtError(err)))
	)
;

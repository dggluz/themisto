import { Task, UncaughtError } from '@ts-task/task';
import { createEndpoint } from '../server-utils/create-endpoint';
import { checkBody } from '../middlewares/check-body.middleware';
import { objOf, str, oneOf, anything } from 'ts-dynamic-type-checker';
import { queryProductsAndGetInformation } from '../providers/easy/easy.provider';
import { assertNever, tap } from '../utils';
import { caseError, isInstanceOf } from '@ts-task/utils';
import { PuppeteerError } from '../puppeteer-utils';

export interface SearchData {
	searchOrderId: string;
	query: string;
	provider: 'easy';
	options: any;
}

export const queryProductCtrl = createEndpoint(req =>
	Task
		.resolve(req)
		// TODO: authenticate request
		.chain(checkBody(objOf<SearchData>({
			searchOrderId: str,
			query: str,
			provider: oneOf('easy'),
			// TODO: improve options typings (relate with the provider)
			options: anything
		})))
		.map(tap(req => console.log(req.body)))
		.chain(req => {
			switch (req.body.provider) {
				case 'easy':
					return queryProductsAndGetInformation(req.body.query);
			}
			assertNever(req.body.provider);
		})
		// TODO: decouple search of products and respond to Ganymedes
		// TODO: manage puppeteer error
		.catch(caseError(isInstanceOf(PuppeteerError), err => Task.reject(new UncaughtError(err))))
	)
;

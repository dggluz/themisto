import { crawle } from '../puppeteer-utils';

// TODO: try to import jquery typings without having jQuery itself as a dependency
import * as $ from 'jquery';

// TODO: get results from subsequent pages
export const getQueryResults = (term: string) => {
	const providerSearchUrl = 'https://www.easy.com.ar/webapp/wcs/stores/servlet/es/SearchDisplay?storeId=10151&catalogId=10051&langId=-5&pageSize=12&beginIndex=0&searchSource=Q&sType=SimpleSearch&resultCatEntryType=2&showResultsPage=true&pageView=image&searchTerm=';
	const url = providerSearchUrl + encodeURIComponent(term);
	return crawle(url, () => {
			const productsDetailUrls = $('#Search_Result_div')
				.find('.thumb-product')
				.find('a.itemhover')
				.map((_i, elem) =>
					$(elem).attr('href')
				)
				.get();
			return Promise.resolve(productsDetailUrls);
		});
};

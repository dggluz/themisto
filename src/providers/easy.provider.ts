import { crawle } from '../puppeteer-utils';

// TODO: try to import jquery typings without having jQuery itself as a dependency
import * as $ from 'jquery';

// TODO: get results from subsequent pages
export const getQueryResults = (term: string) => {
	const providerSearchUrl = 'https://www.easy.com.ar/webapp/wcs/stores/servlet/es/SearchDisplay?storeId=10151&catalogId=10051&langId=-5&pageSize=12&beginIndex=0&searchSource=Q&sType=SimpleSearch&resultCatEntryType=2&showResultsPage=true&pageView=image&searchTerm=';
	const url = providerSearchUrl + encodeURIComponent(term);
	console.log(`Getting data from easy.com.ar about ${term}...`);
	return crawle(url, () => {
			const getProductsDetailUrls = () =>
				$('#Search_Result_div')
					.find('.thumb-product')
					.find('a.itemhover')
					.map((_i, elem) =>
						$(elem).attr('href')
					)
					.get()
			;

			const awaitNewProductsChunk = (url: string) =>
				new Promise<void>((resolve, reject) => {
					console.log('Getting more data...');
					$(document).ajaxSuccess((_e, _jqXHR, opts) => {
						if (opts.url === url) {
							setTimeout(resolve, 10);
						}
					});
					$(document).ajaxError((_e, _jqXHR, opts) => {
						if (opts.url === url) {
							reject(`Could not get ${url}`);
						}
					});
				})
			;
			
			const getAllProducts = () =>
				new Promise<string[]>((resolve, reject) => {
					const $seeMoreButton = $('.see-more:visible');
					if ($seeMoreButton.length) {
						awaitNewProductsChunk($seeMoreButton.parent().data('src'))
							.then(getAllProducts)
							.then(resolve, reject);
						$seeMoreButton.click();
					}
					else {
						resolve(getProductsDetailUrls());
					}
				})
			;

			return getAllProducts();
		});
};

// TODO: complete
export interface ProductInformation {
	sku: string;
	name: string;
}

export const getProductInformation = (url: string) => {
	return crawle(url, () => {
		console.log(`Getting information for product ${url}`);
		return new Promise<ProductInformation>((resolve, reject) => {
			const sku = $('.product-description')
				.children()
				.filter((_index, elem) =>
					$(elem)
						.text()
						.trim()
						.toUpperCase() === 'SKU'
				)
				.next()
				.text()
				.trim()
			;

			const productName = $('.product-description')
				.find('.prod-title')
				.text()
				.trim()
			;

			if (sku && productName) {
				resolve({
					sku,
					name: productName
				});
			}
			else {
				reject(`Could not get information for product ${url}`);
			}
		});
	});
};

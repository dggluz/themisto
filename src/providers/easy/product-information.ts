import { crawle } from '../../puppeteer-utils';

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

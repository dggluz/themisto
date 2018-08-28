import { crawle } from '../../puppeteer-utils';

// TODO: complete
export interface ProductInformation {
	sku: string;
	name: string;
	price: number;
	originalPrice: number;
	// category: string;
	// description: string;
	// images: string[];
}

export const getProductInformation = (url: string) => {
	return crawle(url, () => {
		const parsePrice = (priceText: string) =>
			parseFloat(
				priceText
					.replace('.', '')
					.replace(',', '.')
			)
		;

		const getText = ($elem: JQuery<HTMLElement>) =>
			$elem
				.text()
				.trim()
		;

		const getPrice = ($elem: JQuery<HTMLElement>) =>
			parsePrice(getText($elem));
		;

		const allDefined = ($elems: JQuery<HTMLElement>[]) =>
			$elems
				.every($elem =>
					$elem.length === 1
				)
		;

		console.log(`Getting information for product ${url}`);
		return new Promise<ProductInformation>((resolve, reject) => {
			const $sku = $('.product-description')
				.children()
				.filter((_index, elem) =>
					$(elem)
						.text()
						.trim()
						.toUpperCase() === 'SKU'
				)
				.next()
			;

			const $productName = $('.product-description .prod-title');

			const $price = $('.product-description .price-mas');

			const $originalPrice = $('.product-description .price-e');

			if (allDefined([
				$sku,
				$productName,
				$price,
				$originalPrice
			])) {
				resolve({
					sku: getText($sku),
					name: getText($productName),
					price: getPrice($price),
					originalPrice: getPrice($originalPrice)
				});
			}
			else {
				reject(`Could not get information for product ${url}`);
			}
		});
	});
};

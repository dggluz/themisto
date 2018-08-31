import { crawle } from '../../puppeteer-utils';
import { ProductInformation } from '../product-info';

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

		const getCategoryFromBreadCrumbs = ($breadCrumbs: JQuery<HTMLElement>) =>
			getText($breadCrumbs)
				.split('|')
				// Remove first breadcrumb ("Inicio")
				.slice(1)
				// Remove last breadcrumb (product's name)
				.slice(0, -1)
				.map(anIntermediateCategory =>
					anIntermediateCategory
						.trim()
				)
				.join(' > ')
		;

		const getDescription = ($description: JQuery<HTMLElement>) =>
			getText($description)
				.replace(/^Código de artículo\: \d+/, '')
				.trim()
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

			const $category = $('#breadcrumb');
			
			const $description = $('#Description .tabs-list');

			// TODO: wait for images (sometimes the thumbnails gallery seems to not be loaded)
			const images = $('#flyout_swatches .s7thumb')
				.get()
				.map(elem =>
					$(elem)
						.css('background-image')
						.match(/^url\("(.+)"\)$/)
				)
				.map((matches) => matches && matches[1] || '')
				.filter(anImage => anImage.length)
			;

			if (allDefined([
				$sku,
				$productName,
				$originalPrice,
				$category,
				$description
			])) {
				resolve({
					sku: getText($sku),
					name: getText($productName),
					price: allDefined([$price]) ? getPrice($price) : getPrice($originalPrice),
					originalPrice: getPrice($originalPrice),
					category: getCategoryFromBreadCrumbs($category),
					description: getDescription($description),
					images: images
				});
			}
			else {
				reject(`Could not get information for product ${url}`);
			}
		});
	});
};

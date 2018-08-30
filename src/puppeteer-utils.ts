import {
	 launch,
	 Browser,
	 Page,
	 Response
} from 'puppeteer';
import { Task } from '@ts-task/task';
import { share } from '@ts-task/utils';
import { tapChain } from './utils';

export class PuppeteerError extends Error {
	PuppeteerError = 'PuppeteerError';
}

const launchPuppeteer = () =>
	new Task<Browser, PuppeteerError>((resolve, reject) => {
		launch()
			.then(resolve, err => reject(new PuppeteerError(err)));
	})
;

const createPagePuppeteer = (browser: Browser) =>
	new Task<Page, PuppeteerError>((resolve, reject) => {
		browser
			.newPage()
			.then(resolve, err => reject(new PuppeteerError(err)))
	})
;

const goToPagePuppeteer = (url: string) =>
	(page: Page) =>
		new Task<Response, PuppeteerError>((resolve, reject) => {
			page
				.goto(url, {
					timeout: 0,
					waitUntil: 'domcontentloaded'
				})
				.then(
					response =>
						response ?
							resolve(response) :
							reject(new PuppeteerError(`Could not navigate to ${url}`)),
					err => reject(new PuppeteerError(`Could not navigate to ${url}. ${err.toString()}`))
				)
		})
;

// TODO: improve typings of rest parameters and fn
const evaluateOnPagePuppeteer = <T> (fn: (...args: any[]) => Promise<any>, ...params: any[]) =>
	(page: Page) =>
		new Task<T, PuppeteerError>((resolve, reject) => {
			page.on('console', msg => console.log('PAGE LOG:', msg.text()));
			page
				.evaluate(fn, ...params)
				.then(resolve, err => reject(new PuppeteerError(err)))
	})
;

const closeBrowserPuppeteer = (browser: Browser) =>
	new Task<void, PuppeteerError>((resolve, reject) => {
		browser
			.close()
			.then(resolve, err => reject(new PuppeteerError(err)));
	});
;

// TODO: refactor to reuse the same browser with several pages.
export const crawle = <T> (url: string, fn: (...args: any[]) => Promise<T>, ...params: any[]) =>
	browser
		.chain(createPagePuppeteer)
		.chain(tapChain(goToPagePuppeteer(url)))
		.chain(evaluateOnPagePuppeteer<T>(fn, ...params))
;

const browser = launchPuppeteer()
	.pipe(share())
;

export const closeBrowser = () =>
	browser
		.chain(closeBrowserPuppeteer)
;


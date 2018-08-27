import {
	 launch,
	 Browser,
	 Page,
	 Response
} from 'puppeteer';
import { Task } from '@ts-task/task';

class PuppeteerError extends Error {
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
				.goto(url)
				.then(
					response =>
						response ?
							resolve(response) :
							reject(new PuppeteerError(`Could not navigate to ${url}`)),
					err => reject(new PuppeteerError(err))
				)
		})
;

// TODO: improve typings of rest parameters and fn
const evaluateOnPagePuppeteer = <T> (fn: (...args: any[]) => Promise<any>, ...params: any[]) =>
	(page: Page) =>
		new Task<T, PuppeteerError>((resolve, reject) => {
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

const tapChain = <A, B, E> (fn: (x: A) => Task<B, E>) =>
	(x: A) =>
		fn(x)
			.map(_ => x)
;

export const crawle = <T> (url: string, fn: (...args: any[]) => Promise<T>, ...params: any[]) =>
	launchPuppeteer()
		.chain(
			browser =>
				createPagePuppeteer(browser)
				.chain(tapChain(goToPagePuppeteer(url)))
				.chain(evaluateOnPagePuppeteer<T>(fn, ...params))
				.chain(tapChain(_ => closeBrowserPuppeteer(browser)))
		)
;


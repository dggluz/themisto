import { readAndValidateJSONFile } from './fs-utils';
import { resolve } from 'path';
import { strictObjOf, num, arrOf, str } from 'ts-dynamic-type-checker';

/**
 * Contract (see ts-dynamic-type-checker) to validate against the
 * expected form of the configs.json file (throw TypeError if doesn't
 * validate and types the result if it does)
 * @param target object to validate
 * @returns validated target
 */
const configsContract = strictObjOf({
	ganymede: strictObjOf({
		searchResults: strictObjOf({
			url: str
		})
	}),
	permissions: arrOf(strictObjOf({
		permissionName: str,
		authorizedUsers: arrOf(str)
	})),
	server: strictObjOf({
		port: num
	})
});

/**
 * Shared task to the content of the configs.json file, parsed and validated.
 * If it was a production environment, the file should be an "external file" in docker swarm (or equivalent)
 */
export const configs = readAndValidateJSONFile(resolve(process.cwd(), 'configs.json'), configsContract);

import { existsSync } from "node:fs";
import { resolve } from "node:path";

const CLOUDFLARE_CONFIG_FILENAME = "cloudflare.config.ts";

/**
 * Finds the Cloudflare configuration file in a project directory without
 * loading or validating it.
 *
 * @param projectPath The project directory to inspect
 * @returns The absolute config path, or `undefined` when it does not exist
 */
export function findCloudflareConfigPath(
	projectPath: string
): string | undefined {
	const configPath = resolve(projectPath, CLOUDFLARE_CONFIG_FILENAME);
	return existsSync(configPath) ? configPath : undefined;
}

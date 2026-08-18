import { resolve } from "node:path";
import { runInTempDir, seed } from "@cloudflare/workers-utils/test-helpers";
import { describe, it } from "vitest";
import { findCloudflareConfigPath } from "../discovery";

describe("findCloudflareConfigPath", () => {
	runInTempDir();

	it("returns undefined when the project has no Cloudflare config", ({
		expect,
	}) => {
		expect(findCloudflareConfigPath(process.cwd())).toBeUndefined();
	});

	it("returns the config path without loading the config", async ({
		expect,
	}) => {
		await seed({
			"cloudflare.config.ts": 'throw new Error("should not be loaded");',
		});

		expect(findCloudflareConfigPath(process.cwd())).toBe(
			resolve("cloudflare.config.ts")
		);
	});
});

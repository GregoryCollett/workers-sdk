import { existsSync, readFileSync } from "node:fs";
import * as cliPackages from "@cloudflare/cli-shared-helpers/packages";
import { NpmPackageManager } from "@cloudflare/workers-utils";
import {
	mockConsoleMethods,
	runInTempDir,
	seed,
} from "@cloudflare/workers-utils/test-helpers";
import { describe, it, vi } from "vitest";
import { Framework } from "../src/frameworks/framework-class";
import { Static } from "../src/frameworks/static";
import { runAutoConfig } from "../src/run";
import { createMockContext } from "./helpers/mock-context";
import type { ConfigurationResults } from "../src/frameworks/framework-class";

class ExternalWorkerConfigFramework extends Framework {
	configure(): ConfigurationResults {
		return {
			workerConfig: null,
			buildConfig: { assetsDirectory: "dist" },
		};
	}
}

describe("runAutoConfig()", () => {
	runInTempDir();
	mockConsoleMethods();

	it("creates new configuration and cf scripts by default", async ({
		expect,
	}) => {
		const packageJson = {
			name: "my-static-app",
			scripts: { build: "generate && vite build" },
		};
		await seed({
			"package.json": JSON.stringify(packageJson),
			"public/index.html": "<h1>Hello World</h1>",
		});

		const summary = await runAutoConfig(
			{
				configured: false,
				projectPath: process.cwd(),
				workerName: "my-static-app",
				framework: new Static({ id: "static", name: "Static" }),
				buildCommand: "npm run build",
				outputDir: "public",
				packageJson,
				packageManager: NpmPackageManager,
			},
			{
				context: createMockContext(),
				skipConfirmations: true,
				runBuild: false,
				enableCliInstallation: false,
			}
		);

		expect(summary.workerConfig).toMatchObject({
			name: "my-static-app",
			observability: { enabled: true },
		});
		expect(summary.buildConfig).toEqual({ assetsDirectory: "public" });
		expect(readFileSync("cloudflare.config.ts", "utf8")).toContain(
			'import { defineWorker } from "cf/config";\n\nexport default defineWorker({\n  "name": "my-static-app"'
		);
		expect(readFileSync("wrangler.config.ts", "utf8")).toContain(
			'import { defineWranglerConfig } from "wrangler/experimental-config";\n\nexport default defineWranglerConfig({\n  "assetsDirectory": "public"'
		);
		expect(existsSync("wrangler.jsonc")).toBe(false);
		expect(JSON.parse(readFileSync("package.json", "utf8"))).toMatchObject({
			scripts: {
				build: "generate && vite build",
				deploy: "npm run build && cf deploy --no-build",
				preview: "cf dev",
			},
		});
	});

	it("creates legacy Wrangler configuration when requested", async ({
		expect,
	}) => {
		await seed({ "public/index.html": "<h1>Hello World</h1>" });

		const summary = await runAutoConfig(
			{
				configured: false,
				projectPath: process.cwd(),
				workerName: "my-static-app",
				framework: new Static({ id: "static", name: "Static" }),
				outputDir: "public",
				packageManager: NpmPackageManager,
			},
			{
				target: "wrangler",
				context: createMockContext(),
				skipConfirmations: true,
				runBuild: false,
				enableCliInstallation: false,
			}
		);

		expect(summary.wranglerConfig).toMatchObject({
			name: "my-static-app",
			assets: { directory: "public" },
		});
		expect(JSON.parse(readFileSync("wrangler.jsonc", "utf8"))).toMatchObject({
			name: "my-static-app",
			assets: { directory: "public" },
		});
		expect(existsSync("cloudflare.config.ts")).toBe(false);
		expect(existsSync("wrangler.config.ts")).toBe(false);
		expect(existsSync("wrangler.jsonc")).toBe(true);
	});

	it("installs cf and Wrangler for cf projects", async ({ expect }) => {
		const installPackages = vi
			.spyOn(cliPackages, "installPackages")
			.mockResolvedValue();
		const installWrangler = vi
			.spyOn(cliPackages, "installWrangler")
			.mockResolvedValue();
		const packageJson = { name: "my-static-app" };
		await seed({
			"package.json": JSON.stringify(packageJson),
			"public/index.html": "<h1>Hello World</h1>",
		});

		await runAutoConfig(
			{
				configured: false,
				projectPath: process.cwd(),
				workerName: "my-static-app",
				framework: new Static({ id: "static", name: "Static" }),
				outputDir: "public",
				packageJson,
				packageManager: NpmPackageManager,
			},
			{
				context: createMockContext(),
				skipConfirmations: true,
				runBuild: false,
			}
		);

		expect(installPackages).toHaveBeenCalledWith("npm", ["cf@latest"], {
			dev: true,
			isWorkspaceRoot: false,
		});
		expect(installWrangler).toHaveBeenCalledWith("npm", false);
	});

	it("writes build configuration when an external tool owns the Worker configuration", async ({
		expect,
	}) => {
		await runAutoConfig(
			{
				configured: false,
				projectPath: process.cwd(),
				workerName: "external-config-app",
				framework: new ExternalWorkerConfigFramework({
					id: "static",
					name: "Static",
				}),
				outputDir: "dist",
				packageManager: NpmPackageManager,
			},
			{
				context: createMockContext(),
				skipConfirmations: true,
				runBuild: false,
			}
		);

		expect(existsSync("cloudflare.config.ts")).toBe(false);
		expect(readFileSync("wrangler.config.ts", "utf8")).toContain(
			'"assetsDirectory": "dist"'
		);
	});
});

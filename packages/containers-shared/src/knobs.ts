import { MF_DEV_CONTAINER_PREFIX } from "./registry";
import type { ContainerPrivileges } from "./types";

// Will return the default cloudflare managed registry for either a staging or production environment
// based on the env var WRANGLER_API_ENVIRONMENT. The default registry can be overridden with the env
// var CLOUDFLARE_CONTAINER_REGISTRY.
export const getCloudflareContainerRegistry = () => {
	// previously defaulted to registry.cloudchamber.cfdata.org
	return (
		process.env.CLOUDFLARE_CONTAINER_REGISTRY ??
		(process.env.WRANGLER_API_ENVIRONMENT === "staging"
			? "staging.registry.cloudflare.com"
			: "registry.cloudflare.com")
	);
};

/** Prefixes with the cloudflare-dev namespace. The name should be the container's DO classname, and the tag a build uuid. */
export const getDevContainerImageName = (name: string, tag: string) => {
	return `${MF_DEV_CONTAINER_PREFIX}/${name.toLowerCase()}:${tag}`;
};

/**
 * Docker's FUSE requirements: expose the device, allow mounts through
 * `SYS_ADMIN`, and disable the entire default AppArmor profile because it
 * blocks FUSE mounts.
 */
export const FUSE_CONTAINER_PRIVILEGES: ContainerPrivileges = {
	capabilities: ["SYS_ADMIN"],
	devices: [
		{
			pathOnHost: "/dev/fuse",
			pathInContainer: "/dev/fuse",
			cgroupPermissions: "rwm",
		},
	],
	securityOpt: ["apparmor:unconfined"],
};

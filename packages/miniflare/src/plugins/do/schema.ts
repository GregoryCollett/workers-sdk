import { z } from "zod";

const DOContainerPrivilegesDeviceSchema = z.object({
	pathOnHost: z.string(),
	pathInContainer: z.string(),
	cgroupPermissions: z.string(),
});

const DOContainerPrivilegesSchema = z.object({
	capabilities: z.array(z.string()),
	devices: z.array(DOContainerPrivilegesDeviceSchema),
	securityOpt: z.array(z.string()),
});

export const DOContainerOptionsSchema = z.object({
	imageName: z.string(),
	privileges: DOContainerPrivilegesSchema.optional(),
});
export type DOContainerOptions = z.infer<typeof DOContainerOptionsSchema>;

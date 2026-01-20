import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authKit } from "./auth";

const DEFAULT_ORG_ID = process.env.WORKOS_DEFAULT_ORG_ID!;

const siteStatusValidator = v.union(v.literal("draft"), v.literal("published"));

export const getSitesByOrganization = query({
	args: { organizationWorkosId: v.string() },
	handler: async (ctx, args) => {
		const authUser = await authKit.getAuthUser(ctx);
		if (!authUser) {
			return [];
		}

		const user = await ctx.db
			.query("users")
			.withIndex("authId", (q) => q.eq("authId", authUser.id))
			.unique();

		if (!user) {
			return [];
		}

		const org = await ctx.db
			.query("organizations")
			.withIndex("workosId", (q) => q.eq("workosId", args.organizationWorkosId))
			.unique();

		if (!org) {
			return [];
		}

		const membership = await ctx.db
			.query("organizationMemberships")
			.withIndex("userOrg", (q) =>
				q.eq("userId", user._id).eq("organizationId", org._id),
			)
			.unique();

		if (!membership) {
			return [];
		}

		const sites = await ctx.db
			.query("sites")
			.withIndex("organizationId", (q) => q.eq("organizationId", org._id))
			.collect();

		if (args.organizationWorkosId === DEFAULT_ORG_ID) {
			return sites.filter((site) => site.createdBy === user._id);
		}

		return sites;
	},
});

export const getSiteBySlug = query({
	args: {
		organizationWorkosId: v.string(),
		slug: v.string(),
	},
	handler: async (ctx, args) => {
		const authUser = await authKit.getAuthUser(ctx);
		if (!authUser) {
			return null;
		}

		const user = await ctx.db
			.query("users")
			.withIndex("authId", (q) => q.eq("authId", authUser.id))
			.unique();

		if (!user) {
			return null;
		}

		const org = await ctx.db
			.query("organizations")
			.withIndex("workosId", (q) => q.eq("workosId", args.organizationWorkosId))
			.unique();

		if (!org) {
			return null;
		}

		const membership = await ctx.db
			.query("organizationMemberships")
			.withIndex("userOrg", (q) =>
				q.eq("userId", user._id).eq("organizationId", org._id),
			)
			.unique();

		if (!membership) {
			return null;
		}

		const site = await ctx.db
			.query("sites")
			.withIndex("orgSlug", (q) =>
				q.eq("organizationId", org._id).eq("slug", args.slug),
			)
			.unique();

		if (!site) {
			return null;
		}

		if (args.organizationWorkosId === DEFAULT_ORG_ID) {
			if (site.createdBy !== user._id) {
				return null;
			}
		}

		return site;
	},
});

export const createSite = mutation({
	args: {
		organizationWorkosId: v.string(),
		name: v.string(),
		slug: v.string(),
		description: v.optional(v.string()),
		status: siteStatusValidator,
	},
	handler: async (ctx, args) => {
		const authUser = await authKit.getAuthUser(ctx);
		if (!authUser) {
			throw new Error("Unauthorized");
		}

		const user = await ctx.db
			.query("users")
			.withIndex("authId", (q) => q.eq("authId", authUser.id))
			.unique();

		if (!user) {
			throw new Error("User not found");
		}

		const org = await ctx.db
			.query("organizations")
			.withIndex("workosId", (q) => q.eq("workosId", args.organizationWorkosId))
			.unique();

		if (!org) {
			throw new Error("Organization not found");
		}

		const membership = await ctx.db
			.query("organizationMemberships")
			.withIndex("userOrg", (q) =>
				q.eq("userId", user._id).eq("organizationId", org._id),
			)
			.unique();

		if (!membership) {
			throw new Error("Not a member of this organization");
		}

		const existingSite = await ctx.db
			.query("sites")
			.withIndex("orgSlug", (q) =>
				q.eq("organizationId", org._id).eq("slug", args.slug),
			)
			.unique();

		if (existingSite) {
			throw new Error("A site with this slug already exists");
		}

		const now = Date.now();
		return ctx.db.insert("sites", {
			organizationId: org._id,
			createdBy: user._id,
			name: args.name,
			slug: args.slug,
			description: args.description,
			status: args.status,
			createdAt: now,
			updatedAt: now,
		});
	},
});

export const updateSite = mutation({
	args: {
		siteId: v.id("sites"),
		name: v.optional(v.string()),
		slug: v.optional(v.string()),
		description: v.optional(v.string()),
		status: v.optional(siteStatusValidator),
	},
	handler: async (ctx, args) => {
		const authUser = await authKit.getAuthUser(ctx);
		if (!authUser) {
			throw new Error("Unauthorized");
		}

		const user = await ctx.db
			.query("users")
			.withIndex("authId", (q) => q.eq("authId", authUser.id))
			.unique();

		if (!user) {
			throw new Error("User not found");
		}

		const site = await ctx.db.get(args.siteId);
		if (!site) {
			throw new Error("Site not found");
		}

		const org = await ctx.db.get(site.organizationId);
		if (!org) {
			throw new Error("Organization not found");
		}

		const membership = await ctx.db
			.query("organizationMemberships")
			.withIndex("userOrg", (q) =>
				q.eq("userId", user._id).eq("organizationId", org._id),
			)
			.unique();

		if (!membership) {
			throw new Error("Not a member of this organization");
		}

		if (org.workosId === DEFAULT_ORG_ID) {
			if (site.createdBy !== user._id) {
				throw new Error("You can only edit your own sites");
			}
		}

		if (args.slug !== undefined && args.slug !== site.slug) {
			const newSlug = args.slug;
			const existingSite = await ctx.db
				.query("sites")
				.withIndex("orgSlug", (q) =>
					q.eq("organizationId", site.organizationId).eq("slug", newSlug),
				)
				.unique();

			if (existingSite) {
				throw new Error("A site with this slug already exists");
			}
		}

		const { siteId, ...updates } = args;
		const filteredUpdates = Object.fromEntries(
			Object.entries(updates).filter(([_, v]) => v !== undefined),
		);

		await ctx.db.patch(siteId, {
			...filteredUpdates,
			updatedAt: Date.now(),
		});
	},
});

export const deleteSite = mutation({
	args: { siteId: v.id("sites") },
	handler: async (ctx, args) => {
		const authUser = await authKit.getAuthUser(ctx);
		if (!authUser) {
			throw new Error("Unauthorized");
		}

		const user = await ctx.db
			.query("users")
			.withIndex("authId", (q) => q.eq("authId", authUser.id))
			.unique();

		if (!user) {
			throw new Error("User not found");
		}

		const site = await ctx.db.get(args.siteId);
		if (!site) {
			throw new Error("Site not found");
		}

		const org = await ctx.db.get(site.organizationId);
		if (!org) {
			throw new Error("Organization not found");
		}

		const membership = await ctx.db
			.query("organizationMemberships")
			.withIndex("userOrg", (q) =>
				q.eq("userId", user._id).eq("organizationId", org._id),
			)
			.unique();

		if (!membership) {
			throw new Error("Not a member of this organization");
		}

		if (org.workosId === DEFAULT_ORG_ID) {
			if (site.createdBy !== user._id) {
				throw new Error("You can only delete your own sites");
			}
		}

		await ctx.db.delete(args.siteId);
	},
});

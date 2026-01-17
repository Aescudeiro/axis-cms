import { AuthKit, type AuthFunctions } from "@convex-dev/workos-authkit";
import { components, internal } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { internalAction, query } from "./_generated/server";
import { v } from "convex/values";

const authFunctions: AuthFunctions = internal.auth;

const DEFAULT_ORG_ID = process.env.WORKOS_DEFAULT_ORG_ID!;

export const authKit = new AuthKit<DataModel>(components.workOSAuthKit, {
	authFunctions,
	additionalEventTypes: [
		"organization.created",
		"organization.updated",
		"organization.deleted",
		"organization_membership.created",
		"organization_membership.updated",
		"organization_membership.deleted",
	],
});

export const addUserToDefaultOrg = internalAction({
	args: {
		workosUserId: v.string(),
	},
	handler: async (_ctx, args) => {
		await authKit.workos.userManagement.createOrganizationMembership({
			userId: args.workosUserId,
			organizationId: DEFAULT_ORG_ID,
			roleSlug: "member",
		});
	},
});

export const { authKitEvent } = authKit.events(
	{
		"user.created": async (ctx, event) => {
			const now = Date.now();
			await ctx.db.insert("users", {
				authId: event.data.id,
				email: event.data.email,
				name:
					`${event.data.firstName ?? ""} ${event.data.lastName ?? ""}`.trim() ||
					undefined,
				createdAt: now,
				updatedAt: now,
			});

			// Add user to the default "Personal Workspace" org
			await ctx.scheduler.runAfter(0, internal.auth.addUserToDefaultOrg, {
				workosUserId: event.data.id,
			});
		},

		"user.updated": async (ctx, event) => {
			const now = Date.now();
			const user = await ctx.db
				.query("users")
				.withIndex("authId", (q) => q.eq("authId", event.data.id))
				.unique();

			const userData = {
				email: event.data.email,
				name:
					`${event.data.firstName ?? ""} ${event.data.lastName ?? ""}`.trim() ||
					undefined,
			};

			if (!user) {
				await ctx.db.insert("users", {
					authId: event.data.id,
					...userData,
					createdAt: now,
					updatedAt: now,
				});
				return;
			}

			await ctx.db.patch(user._id, { ...userData, updatedAt: now });
		},

		"user.deleted": async (ctx, event) => {
			const user = await ctx.db
				.query("users")
				.withIndex("authId", (q) => q.eq("authId", event.data.id))
				.unique();

			if (!user) {
				return;
			}

			const memberships = await ctx.db
				.query("organizationMemberships")
				.withIndex("userId", (q) => q.eq("userId", user._id))
				.collect();

			for (const membership of memberships) {
				await ctx.db.delete(membership._id);
			}

			await ctx.db.delete(user._id);
		},

		"organization.created": async (ctx, event) => {
			const now = Date.now();
			await ctx.db.insert("organizations", {
				workosId: event.data.id,
				name: event.data.name,
				createdAt: now,
				updatedAt: now,
			});
		},

		"organization.updated": async (ctx, event) => {
			const now = Date.now();
			const org = await ctx.db
				.query("organizations")
				.withIndex("workosId", (q) => q.eq("workosId", event.data.id))
				.unique();

			if (!org) {
				await ctx.db.insert("organizations", {
					workosId: event.data.id,
					name: event.data.name,
					createdAt: now,
					updatedAt: now,
				});
				return;
			}

			await ctx.db.patch(org._id, { name: event.data.name, updatedAt: now });
		},

		"organization.deleted": async (ctx, event) => {
			const org = await ctx.db
				.query("organizations")
				.withIndex("workosId", (q) => q.eq("workosId", event.data.id))
				.unique();

			if (!org) return;

			const memberships = await ctx.db
				.query("organizationMemberships")
				.withIndex("organizationId", (q) => q.eq("organizationId", org._id))
				.collect();

			for (const membership of memberships) {
				await ctx.db.delete(membership._id);
			}

			await ctx.db.delete(org._id);
		},

		"organization_membership.created": async (ctx, event) => {
			const { userId, organizationId, role } = event.data;

			const user = await ctx.db
				.query("users")
				.withIndex("authId", (q) => q.eq("authId", userId))
				.unique();

			if (!user) {
				console.warn(`User not found for membership: ${userId}`);
				return;
			}

			const org = await ctx.db
				.query("organizations")
				.withIndex("workosId", (q) => q.eq("workosId", organizationId))
				.unique();

			if (!org) {
				console.warn(`Organization not found for membership: ${organizationId}`);
				return;
			}

			const existingMembership = await ctx.db
				.query("organizationMemberships")
				.withIndex("userOrg", (q) =>
					q.eq("userId", user._id).eq("organizationId", org._id),
				)
				.unique();

			if (!existingMembership) {
				const now = Date.now();
				await ctx.db.insert("organizationMemberships", {
					userId: user._id,
					organizationId: org._id,
					role: role.slug as "admin" | "member",
					createdAt: now,
					updatedAt: now,
				});
			}
		},

		"organization_membership.updated": async (ctx, event) => {
			const { userId, organizationId, role } = event.data;

			const user = await ctx.db
				.query("users")
				.withIndex("authId", (q) => q.eq("authId", userId))
				.unique();

			if (!user) return;

			const org = await ctx.db
				.query("organizations")
				.withIndex("workosId", (q) => q.eq("workosId", organizationId))
				.unique();

			if (!org) return;

			const membership = await ctx.db
				.query("organizationMemberships")
				.withIndex("userOrg", (q) =>
					q.eq("userId", user._id).eq("organizationId", org._id),
				)
				.unique();

			if (membership) {
				await ctx.db.patch(membership._id, {
					role: role.slug as "admin" | "member",
					updatedAt: Date.now(),
				});
			}
		},

		"organization_membership.deleted": async (ctx, event) => {
			const { userId, organizationId } = event.data;

			const user = await ctx.db
				.query("users")
				.withIndex("authId", (q) => q.eq("authId", userId))
				.unique();

			if (!user) return;

			const org = await ctx.db
				.query("organizations")
				.withIndex("workosId", (q) => q.eq("workosId", organizationId))
				.unique();

			if (!org) return;

			const membership = await ctx.db
				.query("organizationMemberships")
				.withIndex("userOrg", (q) =>
					q.eq("userId", user._id).eq("organizationId", org._id),
				)
				.unique();

			if (membership) {
				await ctx.db.delete(membership._id);
			}
		},
	},
);

export const getCurrentUser = query({
	args: {},
	handler: async (ctx) => {
		const authUser = await authKit.getAuthUser(ctx);
		if (!authUser) {
			return null;
		}

		return ctx.db
			.query("users")
			.withIndex("authId", (q) => q.eq("authId", authUser.id))
			.unique();
	},
});

export const getUserOrganizations = query({
	args: {},
	handler: async (ctx) => {
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

		const memberships = await ctx.db
			.query("organizationMemberships")
			.withIndex("userId", (q) => q.eq("userId", user._id))
			.collect();

		const organizations = await Promise.all(
			memberships.map(async (m) => {
				const org = await ctx.db.get(m.organizationId);
				return org;
			}),
		);

		return organizations.filter((org) => org !== null);
	},
});

export const getOrganizationByWorkosId = query({
	args: { workosId: v.string() },
	handler: async (ctx, args) => {
		return ctx.db
			.query("organizations")
			.withIndex("workosId", (q) => q.eq("workosId", args.workosId))
			.unique();
	},
});

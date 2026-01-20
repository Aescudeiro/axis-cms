import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const roleValidator = v.union(v.literal("admin"), v.literal("member"));

const siteStatusValidator = v.union(v.literal("draft"), v.literal("published"));

export default defineSchema({
	users: defineTable({
		authId: v.string(),
		email: v.string(),
		name: v.optional(v.string()),
		createdAt: v.number(),
		updatedAt: v.number(),
	}).index("authId", ["authId"]),

	organizations: defineTable({
		workosId: v.string(),
		name: v.string(),
		createdAt: v.number(),
		updatedAt: v.number(),
	}).index("workosId", ["workosId"]),

	organizationMemberships: defineTable({
		userId: v.id("users"),
		organizationId: v.id("organizations"),
		role: roleValidator,
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("userId", ["userId"])
		.index("organizationId", ["organizationId"])
		.index("userOrg", ["userId", "organizationId"]),

	sites: defineTable({
		organizationId: v.id("organizations"),
		createdBy: v.id("users"),
		name: v.string(),
		slug: v.string(),
		description: v.optional(v.string()),
		status: siteStatusValidator,
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index("organizationId", ["organizationId"])
		.index("orgSlug", ["organizationId", "slug"])
		.index("createdBy", ["createdBy"]),
});

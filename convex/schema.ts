import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// WorkOS role slugs
const roleValidator = v.union(v.literal("admin"), v.literal("member"));

export default defineSchema({
	users: defineTable({
		authId: v.string(), // WorkOS user ID
		email: v.string(),
		name: v.optional(v.string()),
		createdAt: v.number(),
		updatedAt: v.number(),
	}).index("authId", ["authId"]),

	organizations: defineTable({
		workosId: v.string(), // WorkOS organization ID
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
});

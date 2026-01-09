import { createFileRoute } from "@tanstack/react-router";
import { signOut } from "@workos/authkit-tanstack-react-start";

export const Route = createFileRoute("/app/logout")({
	preload: false,
	loader: async () => {
		await signOut();
	},
});

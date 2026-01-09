import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import type { AuthResult } from "@workos/authkit-tanstack-react-start";
import * as TanstackQuery from "./integrations/tanstack-query/root-provider";

import { routeTree } from "./routeTree.gen";

export function getRouter() {
	const rqContext = TanstackQuery.getContext();

	const router = createRouter({
		routeTree,
		scrollRestoration: true,
		context: {
			...rqContext,
			auth: (() => {
				throw new Error("Auth is not initialized");
			}) as () => AuthResult,
		},

		defaultPreload: "intent",

		defaultNotFoundComponent: () => <div>Not found</div>,
	});

	setupRouterSsrQueryIntegration({
		router,
		queryClient: rqContext.queryClient,
	});

	return router;
}

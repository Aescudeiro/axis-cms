/// <reference types="vite/client" />

import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import type { TRPCOptionsProxy } from "@trpc/tanstack-react-query";
import type { AuthResult } from "@workos/authkit-tanstack-react-start";
import {
	AuthKitProvider,
	getAuthAction,
} from "@workos/authkit-tanstack-react-start/client";
import type { ReactNode } from "react";
import TanStackQueryDevtools from "@/integrations/tanstack-query/devtools";
import type { TRPCRouter } from "@/integrations/trpc/router";
import appCss from "../global.css?url";

interface MyRouterContext {
	queryClient: QueryClient;
	trpc: TRPCOptionsProxy<TRPCRouter>;
	auth: () => AuthResult;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Axis CMS",
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),
	loader: async () => {
		const auth = await getAuthAction();

		return {
			auth,
		};
	},
	component: RootComponent,
});

function RootComponent() {
	const { auth } = Route.useLoaderData();

	return (
		<RootDocument>
			<AuthKitProvider initialAuth={auth}>
				<Outlet />
			</AuthKitProvider>
		</RootDocument>
	);
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				{children}
				<TanStackDevtools
					config={{
						position: "bottom-right",
					}}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
						TanStackQueryDevtools,
					]}
				/>
				<Scripts />
			</body>
		</html>
	);
}

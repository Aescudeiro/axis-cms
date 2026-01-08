import type { TRPCRouterRecord } from "@trpc/server";
import { createTRPCRouter } from "./init";

const todosRouter = {} satisfies TRPCRouterRecord;

export const trpcRouter = createTRPCRouter({
	todos: todosRouter,
});
export type TRPCRouter = typeof trpcRouter;

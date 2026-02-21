import { credentialsRouter } from "@/features/credentials/server/routers";
import { createTRPCRouter } from "../init";
import { workflowRouter } from "@/features/workflows/server/routers";

export const appRouter = createTRPCRouter({
  workflows: workflowRouter,
  credentials: credentialsRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;

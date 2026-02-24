import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useExecutionsParams } from "./use-executions-params";

/**
 * Hook to fetch all executions using suspense
 */
export const useSuspenseExecutions = () => {
  const trpc = useTRPC();
  const [params] = useExecutionsParams();

  const { data } = useSuspenseQuery(
    trpc.executions.getMany.queryOptions(params),
  );
  return data;
};

/**
 * Hook to fetch a single executions using suspense
 */
export const useSuspenseExecution = (id: string) => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.executions.getOne.queryOptions({ id }),
  );
  return data;
};

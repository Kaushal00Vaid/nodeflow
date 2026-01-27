import { requireAuth } from "@/lib/auth-utils";

const Page = async () => {
  await requireAuth();

  return <p>Executions page</p>;
};

export default Page;

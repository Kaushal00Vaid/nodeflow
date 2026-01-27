import { requireAuth } from "@/lib/auth-utils";

const Page = async () => {
  await requireAuth();
  return <p>Credentials page</p>;
};

export default Page;

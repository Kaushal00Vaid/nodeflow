import prisma from "@/lib/db";
import { inngest } from "./client";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    // fetchjing vid
    await step.sleep("fetching", "5s");

    // transcribing
    await step.sleep("transcribing", "5s");

    // sending to ai
    await step.sleep("sending", "5s");

    await step.run("create-workflow", () => {
      return prisma.workflow.create({
        data: {
          name: "workflow-from-inngest",
        },
      });
    });
  },
);

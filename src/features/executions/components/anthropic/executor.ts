import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import { generateText } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import Handlebars from "handlebars";
import { anthropicChannel } from "@/inngest/channels/anthropic";
import prisma from "@/lib/db";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);

  return safeString;
});

type AnthropicData = {
  variableName?: string;
  model?: string;
  credentialId?: string;
  systemPrompt?: string;
  userPrompt?: string;
};

export const AnthropicExecutor: NodeExecutor<AnthropicData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(
    anthropicChannel().status({
      nodeId,
      status: "loading",
    }),
  );

  if (!data.variableName) {
    await publish(
      anthropicChannel().status({
        nodeId,
        status: "error",
      }),
    );

    throw new NonRetriableError("Anthropic node: Variable name is missing");
  }

  if (!data.credentialId) {
    await publish(
      anthropicChannel().status({
        nodeId,
        status: "error",
      }),
    );

    throw new NonRetriableError("Anthropic node: Credential is missing");
  }

  if (!data.userPrompt) {
    await publish(
      anthropicChannel().status({
        nodeId,
        status: "error",
      }),
    );

    throw new NonRetriableError("Anthropic node: User Prompt is missing");
  }

  const systemPrompt = data.systemPrompt
    ? Handlebars.compile(data.systemPrompt)(context)
    : "You are a helpful assistant.";

  const userPrompt = Handlebars.compile(data.userPrompt)(context);

  const credential = await step.run("get-credential", () => {
    return prisma.credential.findUnique({
      where: {
        id: data.credentialId,
      },
    });
  });

  if (!credential) {
    throw new NonRetriableError("Anthropic Node: Credential not found");
  }

  // const credentialValue = process.env.ANTHROPIC_API_KEY;

  const anthropic = createAnthropic({
    apiKey: credential.value,
  });

  try {
    const { steps } = await step.ai.wrap(
      "anthropic-generate-text",
      generateText,
      {
        model: anthropic(data.model || "claude-sonnet-4-0"),
        system: systemPrompt,
        prompt: userPrompt,
        experimental_telemetry: {
          isEnabled: true,
          recordInputs: true,
          recordOutputs: true,
        },
      },
    );

    const text =
      steps[0].content[0].type === "text" ? steps[0].content[0].text : "";

    await publish(
      anthropicChannel().status({
        nodeId,
        status: "success",
      }),
    );

    return {
      ...context,
      [data.variableName]: {
        text,
      },
    };
  } catch (e) {
    await publish(
      anthropicChannel().status({
        nodeId,
        status: "error",
      }),
    );

    throw e;
  }
};

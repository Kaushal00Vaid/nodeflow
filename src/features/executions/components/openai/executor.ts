import type { NodeExecutor } from "@/features/executions/types";
import { NonRetriableError } from "inngest";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import Handlebars from "handlebars";
import { openAiChannel } from "@/inngest/channels/openai";
import prisma from "@/lib/db";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);

  return safeString;
});

type OpenAiData = {
  variableName?: string;
  model?: string;
  credentialId?: string;
  systemPrompt?: string;
  userPrompt?: string;
};

export const OpenAiExecutor: NodeExecutor<OpenAiData> = async ({
  data,
  nodeId,
  userId,
  context,
  step,
  publish,
}) => {
  await publish(
    openAiChannel().status({
      nodeId,
      status: "loading",
    }),
  );

  if (!data.variableName) {
    await publish(
      openAiChannel().status({
        nodeId,
        status: "error",
      }),
    );

    throw new NonRetriableError("OpenAI node: Variable name is missing");
  }

  if (!data.credentialId) {
    await publish(
      openAiChannel().status({
        nodeId,
        status: "error",
      }),
    );

    throw new NonRetriableError("OpenAI node: Credential is missing");
  }

  if (!data.userPrompt) {
    await publish(
      openAiChannel().status({
        nodeId,
        status: "error",
      }),
    );

    throw new NonRetriableError("OpenAI node: User Prompt is missing");
  }

  const systemPrompt = data.systemPrompt
    ? Handlebars.compile(data.systemPrompt)(context)
    : "You are a helpful assistant.";

  const userPrompt = Handlebars.compile(data.userPrompt)(context);

  const credential = await step.run("get-credential", () => {
    return prisma.credential.findUnique({
      where: {
        id: data.credentialId,
        userId,
      },
    });
  });

  if (!credential) {
    await publish(
      openAiChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("OpenAI Node: Credential not found");
  }

  // const credentialValue = process.env.OPENAI_API_KEY;

  const openai = createOpenAI({
    apiKey: credential.value,
    // baseURL: `${process.env.BASE_URL}/openai/v1`, // JUST for me
  });

  try {
    const { steps } = await step.ai.wrap("openai-generate-text", generateText, {
      model: openai(data.model || "gpt-4.1"),
      system: systemPrompt,
      prompt: userPrompt,
      experimental_telemetry: {
        isEnabled: true,
        recordInputs: true,
        recordOutputs: true,
      },
    });

    const text =
      steps[0].content[0].type === "text" ? steps[0].content[0].text : "";

    await publish(
      openAiChannel().status({
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
      openAiChannel().status({
        nodeId,
        status: "error",
      }),
    );

    throw e;
  }
};

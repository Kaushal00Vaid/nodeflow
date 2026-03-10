<h1 align="center"> Nodeflow </h1>

**Nodeflow** is a full-stack workflow automation platform (similar to n8n or Zapier) desined to orchestrate complex tasks through a Directed Acyclic Graph (DAG) structure. It enables users to build automated pipelines that connect various third-party services with type-safe reliability.

## Key Features
- **Custom DAG Engine**: Built with topological sorting to resolve node dependencies and manage execution flow.
- **Reliable Queuing**: Powered by Inngest to manage FIFO execution queues per level, ensuring distributed and resilient node runs.
- **Data Interpolation**: Dynamic variable parsing that allows downstream nodes to reference and use data from previous steps in real-time.
- **Native Integrations**: Built-in support for OpenAI, Gemini, Stripe, Discord, and Slack.
- **Modern Auth & Payments**: Secure multi-provider authentication via Better Auth and monetization/billing via Polar.

## Tech Stack
- Framework: Next.js (App Router)
- API: tRPC (End-to-end type safety)
- Database: PostgreSQL with Prisma ORM
- Workflow Orchestration: Inngest
- AI Integration: Vercel AI SDK
- Validation: Zod
- Styling: Tailwind CSS + Shadcn UI

## Getting Started
> Follow these steps to get a local copy up and running.

1. **Clone the repository**
```bash
git clone https://github.com/Kaushal00Vaid/nodeflow.git
cd nodeflow
```

2. **Environment Setup**
Copy the example environment file and fill in your secrets (Database URL, Inngest Keys, Auth secrets, etc)
> NOTE: Anthropic, Google, Openai Keys are optional to have
```bash
cp .env.example .env
```

3. Install Dependencies
```bash
npm install
```

4. Run the Development Server
This project uses **mprocs** to run the Next.js and background workers simultaneously:
```bash
npm run dev:all
```

## Architecture
The platform is built on a "Level-Order" execution strategy. By using topological sorting, the engine identifies independent nodes and processes them using Inngest workers, ensuring that no node runs until its dependencies are successfully resolved.

---

<p align="center">
  <i>Happy Learning. Happy Coding :)</i>
</p>

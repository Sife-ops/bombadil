import { use, StackContext, StaticSite } from "@serverless-stack/resources";
import { Api } from "./Api";

export function Web({ stack }: StackContext) {
  const api = use(Api);

  const site = new StaticSite(stack, "site", {
    path: "web",
    buildCommand: "npm run build",
    buildOutput: "dist",
    environment: {
      VITE_API_URL: api.api.url,
      VITE_WS_API_URL: api.webSocketApi.url,
    },
  });

  api.api.addRoutes(stack, {
    "POST /bot": {
      function: {
        bind: [site, api.botQueue],
        environment: { HANDLER_TYPE: "bot" },
        handler: "functions/bot/main.handler",
      },
    },
  });

  stack.addOutputs({
    SITE: site.url,
  });
}

import { use, StackContext, StaticSite } from "@serverless-stack/resources";
import { Api } from "./Api";

export function Web({ stack }: StackContext) {
  const { api, botQueue, webSocketApi } = use(Api);

  const site = new StaticSite(stack, "site", {
    path: "web",
    buildCommand: "npm run build",
    buildOutput: "dist",
    environment: {
      VITE_API_URL: api.url,
      VITE_WS_API_URL: webSocketApi.url,
    },
  });

  api.addRoutes(stack, {
    "POST /bot": {
      function: {
        bind: [site, botQueue],
        environment: { HANDLER_TYPE: "bot" },
        handler: "functions/bot/main.bot",
      },
    },
  });

  stack.addOutputs({
    SITE: site.url,
  });
}

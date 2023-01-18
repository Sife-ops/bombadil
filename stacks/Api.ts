import {
  use,
  StackContext,
  Api as ApiGateway,
  Config,
  Queue,
} from "@serverless-stack/resources";
import { Database } from "./Database";

export function Api({ stack }: StackContext) {
  const table = use(Database);

  const botPublicKey = new Config.Secret(stack, "BOT_PUBLIC_KEY");

  const onboardQueue = new Queue(stack, "onboardQueue", {
    consumer: {
      function: {
        handler: "functions/onboardQueue.handler",
        bind: [table],
      },
    },
  });

  const api = new ApiGateway(stack, "api", {
    defaults: {
      function: {
        bind: [table, botPublicKey, onboardQueue],
      },
    },
    routes: {
      "POST /game": {
        function: {
          handler: "functions/rest/game.handler",
        },
      },
      "POST /bot": {
        function: {
          handler: "functions/bot/main.handler",
        },
      },
    },
  });

  stack.addOutputs({
    API: api.url,
  });

  return api;
}

import {
  use,
  StackContext,
  Api as ApiGateway,
  Config,
  Queue,
  WebSocketApi,
} from "@serverless-stack/resources";
import { Database } from "./Database";

export function Api({ stack }: StackContext) {
  const table = use(Database);
  const botPublicKey = new Config.Secret(stack, "BOT_PUBLIC_KEY");

  const webSocketApi = new WebSocketApi(stack, "webSocketApi", {
    defaults: {
      function: {
        bind: [table],
      },
    },
    routes: {
      $connect: "functions/webSocket.connect",
      $disconnect: "functions/webSocket.disconnect",
      $default: "functions/webSocket.default_",
    },
  });

  const api = new ApiGateway(stack, "api", {
    defaults: {
      function: {
        bind: [table, botPublicKey, webSocketApi],
        permissions: ["execute-api"],
      },
    },
    routes: {
      "POST /game": {
        function: {
          handler: "functions/game.handler",
        },
      },
    },
  });

  const botQueue = new Queue(stack, "botQueue", {
    consumer: {
      function: {
        bind: [table, webSocketApi],
        environment: { HANDLER_TYPE: "consumer" },
        permissions: ["execute-api"],
        handler: "functions/bot/consumer.handler",
      },
    },
  });

  stack.addOutputs({
    API: api.url,
    WS_API: webSocketApi.url,
  });

  return {
    api,
    webSocketApi,
    botQueue,
  };
}

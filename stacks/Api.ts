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

  const onboardQueue = new Queue(stack, "onboardQueue", {
    consumer: {
      function: {
        handler: "functions/onboardQueue.handler",
        bind: [table],
      },
    },
  });

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
        bind: [table, botPublicKey, onboardQueue, webSocketApi],
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

  stack.addOutputs({
    API: api.url,
    WS_API: webSocketApi.url,
  });

  return {
    api,
    webSocketApi,
  };
}

import { APIGatewayProxyHandler, APIGatewayProxyHandlerV2 } from "aws-lambda";
import { model } from "@bombadil/core/model";

const fn = (s: string) => {
  return {
    statusCode: 200,
    headers: { "Content-Type": "text/plain" },
    body: s,
  };
};

export const connect: APIGatewayProxyHandlerV2 = async (event) => {
  return fn("connected");
};

export const disconnect: APIGatewayProxyHandler = async (event) => {
  await model.entities.ConnectionEntity.delete({
    connectionId: event.requestContext.connectionId!,
  }).go();

  return fn("disconnected");
};

export const default_: APIGatewayProxyHandler = async (event) => {
  const parsedBody = JSON.parse(event.body!);

  switch (parsedBody.action) {
    case "game": {
      await model.entities.ConnectionEntity.query
        .game_({
          clientId: parsedBody.data.clientId,
          gameId: parsedBody.data.gameId,
        })
        .go()
        .then((e) => e.data[0])
        .then((connection) =>
          !!connection
            ? model.entities.ConnectionEntity.delete({
                connectionId: connection.connectionId,
              }).go()
            : undefined
        );

      await model.entities.ConnectionEntity.create({
        clientId: parsedBody.data.clientId,
        connectionId: event.requestContext.connectionId!,
        gameId: parsedBody.data.gameId,
      }).go();

      return fn("connected to game");
    }

    case "ping": {
      return fn("pong");
    }

    default: {
      return { statusCode: 404, body: "unknown action" };
    }
  }
};

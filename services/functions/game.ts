import {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
  Handler,
} from "aws-lambda";

import { model } from "@bombadil/core/model";

const fn = (o: { ok: boolean; data?: any }) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ ...o }),
  };
};

export const handler: Handler<
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2
> = async (event) => {
  try {
    const { gameId } = JSON.parse(event.body!);

    const { data: gameCollection } = await model.collections
      .game({ gameId })
      .go();

    const users = await Promise.all(
      gameCollection.PlayerEntity.map((player) =>
        model.entities.UserEntity.get({
          userId: player.userId,
        })
          .go()
          .then((e) => e.data)
      )
    );

    return fn({
      ok: true,
      data: {
        gameCollection,
        users,
      },
    });
  } catch (e) {
    return fn({ ok: false });
  }
};

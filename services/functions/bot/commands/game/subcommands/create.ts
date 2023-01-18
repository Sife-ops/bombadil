import { Command } from "@bombadil/bot/runner";
import { genericResponse } from "@bombadil/bot/common";
import { model } from "@bombadil/core/model";

export const create: Command = {
  handler: async (ctx) => {
    const userId = ctx.getUserId();
    const channelId = ctx.getChannelId();

    /**
     * 1) one game per channel
     * 2) map must exist
     * 3) create game
     */

    // 1) one game per channel
    if (ctx.hasGame()) {
      return genericResponse("game already exists");
    }

    // 2) map must exist
    const map = await model.entities.MapEntity.query
      .map({ mapId: ctx.getOptionValue("map") as string })
      .go()
      .then(({ data }) => data[0]?.data);

    if (!map) {
      return genericResponse("map does not exist");
    }

    // 3) create game
    const gameId = await model.entities.GameEntity.create({
      channelId,
      map,
      userId,
    })
      .go()
      .then(({ data }) => data.gameId);

    await model.entities.PlayerEntity.create({ gameId, userId }).go();

    return {
      type: 4,
      data: {
        content: `game created`,
        embeds: [
          {
            title: "game url",
            url: `https://${ctx.env.WEB_URL}/game/${gameId}`,
            color: 0xff0000,
          },
        ],
      },
    };
  },
};

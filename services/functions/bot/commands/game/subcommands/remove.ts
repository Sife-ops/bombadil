import { Command } from "@bombadil/bot/runner";
import { genericResponse } from "@bombadil/bot/common";
import { model } from "@bombadil/core/model";

export const remove: Command = {
  handler: async (ctx) => {
    const userId = ctx.getOptionValue("player") as string;

    if (userId === ctx.getUserId()) {
      return genericResponse("cannot remove organizer");
    }

    // todo: refer to ctx.gameCollection
    const playerId = await model.entities.PlayerEntity.query
      .game_({
        gameId: ctx.getGame().gameId,
        userId,
      })
      .go()
      .then(({ data }) => data[0]?.playerId);

    if (!playerId) {
      return genericResponse("player does not exist");
    }

    await model.entities.PlayerEntity.remove({ playerId }).go();

    return genericResponse("removed player");
  },
};

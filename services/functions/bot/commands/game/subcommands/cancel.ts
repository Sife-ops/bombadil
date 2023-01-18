import { Command } from "@bombadil/bot/runner";
import { genericResponse } from "@bombadil/bot/common";
import { model } from "@bombadil/core/model";

export const cancel: Command = {
  handler: async (ctx) => {
    await model.entities.GameEntity.update({
      channelId: ctx.getChannelId(),
      gameId: ctx.getGame().gameId,
    })
      .set({ winner: "none" })
      .go();

    return genericResponse("game cancelled");
  },
};

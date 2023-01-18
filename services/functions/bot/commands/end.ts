import { genericResponse } from "@bombadil/bot/common";
import { model } from "@bombadil/core/model";
import { Command } from "../runner";

export const end: Command = {
  handler: async (ctx) => {
    if (ctx.getRound() < 2) {
      if (
        ctx.getPlayerBuildings().length < ctx.getRound() + 1 ||
        ctx.getPlayerRoads().length < ctx.getRound() + 1
      ) {
        return genericResponse("must place a settlement and road");
      }
    }

    const nextPlayerIndex =
      ctx.getPlayer().playerIndex < ctx.getPlayers().length - 1
        ? ctx.getPlayer().playerIndex + 1
        : 0;

    await model.entities.GameEntity.update({
      channelId: ctx.getChannelId(),
      gameId: ctx.getGame().gameId,
    })
      .set({
        playerIndex: nextPlayerIndex,
        round:
          ctx.getPlayer().playerIndex < ctx.getPlayers().length - 1
            ? ctx.getGame().round
            : ctx.getGame().round + 1,
      })
      .go();

    return genericResponse(
      `<@${ctx.getUserId()}> ended their turn, it is <@${
        ctx.getPlayer(nextPlayerIndex).userId
      }>'s turn`
    );
  },
};

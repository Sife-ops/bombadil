import { Command } from "../runner";
import { genericResponse, genericResult } from "@bombadil/bot/common";
import { model } from "@bombadil/core/model";

export const end: Command = {
  handler: async (ctx) => {
    const nextPlayerIndex =
      ctx.getPlayer().playerIndex < ctx.getPlayers().length - 1
        ? ctx.getPlayer().playerIndex + 1
        : 0;

    return {
      bot: async () => {
        if (ctx.getRound() < 2) {
          if (
            ctx.getPlayerBuildings().length < ctx.getRound() + 1 ||
            ctx.getPlayerRoads().length < ctx.getRound() + 1
          ) {
            return genericResult("must place a settlement and road");
          }
        }

        return {
          mutations: [ctx.enqueueBot()],
          response: genericResponse(
            `<@${ctx.getUserId()}> ended their turn, it is <@${
              ctx.getPlayer(nextPlayerIndex).userId
            }>'s turn`
          ),
        };
      },

      consumer: async () => {
        return {
          mutations: [
            model.entities.GameEntity.update({
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
              .go(),
          ],
          response: {},
        };
      },
    };
  },
};

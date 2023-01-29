import { Command } from "@bombadil/bot/runner";
import { genericResponse, genericResult } from "@bombadil/bot/common";

export const remove: Command = {
  handler: async (ctx) => {
    const userId = ctx.getOptionValue("player") as string;
    const player = ctx.getPlayers().find((e) => e.userId === userId);

    return {
      bot: async () => {
        if (userId === ctx.getUserId()) {
          return genericResult("cannot remove organizer");
        }

        if (!player) {
          return genericResult("player does not exist");
        }

        return {
          mutations: [ctx.enqueueBot()],
          response: genericResponse("removed player"),
        };
      },
      consumer: async () => {
        if (!player) return;
        return {
          mutations: [
            ctx.model.entities.PlayerEntity.remove({
              playerId: player.playerId,
            }).go(),
          ],
          response: {},
        };
      },
    };
  },
};

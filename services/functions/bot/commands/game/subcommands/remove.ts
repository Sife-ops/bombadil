import { Command } from "@bombadil/bot/runner";
import { genericResponse, runnerResponse } from "@bombadil/bot/common";
import { model } from "@bombadil/core/model";

export const remove: Command = {
  handler: async (ctx) => ({
    bot: async () => {
      const userId = ctx.getOptionValue("player") as string;

      if (userId === ctx.getUserId()) {
        return runnerResponse("cannot remove organizer");
      }

      const player = ctx.getPlayers().find((e) => e.userId === userId);
      if (!player) {
        return runnerResponse("player does not exist");
      }

      return {
        mutations: [
          model.entities.PlayerEntity.remove({
            playerId: player.playerId,
          }).go(),
        ],
        response: genericResponse("removed player"),
      };
    },
    consumer: async () => {
      return;
    },
  }),
};

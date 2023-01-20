import { genericResponse, runnerResponse } from "@bombadil/bot/common";
import { Command } from "@bombadil/bot/runner";
import { model } from "@bombadil/core/model";

export const add: Command = {
  handler: async (ctx) => {
    return {
      bot: async () => {
        const { gameId } = ctx.getGame();
        const userId = ctx.getOptionValue("player") as string;

        if (!!ctx.getPlayers().find((p) => p.userId === userId)) {
          return runnerResponse("already added");
        }

        return {
          mutations: [
            model.entities.PlayerEntity.create({ gameId, userId }).go(),
          ],
          response: genericResponse("added player"),
        };
      },
      consumer: async () => {
        return;
      },
    };
  },
};

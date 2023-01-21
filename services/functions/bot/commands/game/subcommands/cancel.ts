import { Command } from "@bombadil/bot/runner";
import { genericResponse } from "@bombadil/bot/common";
import { model } from "@bombadil/core/model";

export const cancel: Command = {
  handler: async (ctx) => ({
    bot: async () => {
      return {
        mutations: [ctx.enqueueBot()],
        response: genericResponse("game cancelled"),
      };
    },
    consumer: async () => {
      try {
        return {
          mutations: [
            model.entities.GameEntity.update({
              channelId: ctx.getChannelId(),
              gameId: ctx.getGame().gameId,
            })
              .set({ winner: "none" })
              .go(),
          ],
          response: {},
        };
      } catch {
        return;
      }
    },
  }),
};

import { Command } from "@bombadil/bot/runner";
import { genericResponse } from "@bombadil/bot/common";

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
            ctx.model.entities.GameEntity.update({
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

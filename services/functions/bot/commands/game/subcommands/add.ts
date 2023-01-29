import { Command } from "@bombadil/bot/runner";
import { genericResponse, genericResult } from "@bombadil/bot/common";

export const add: Command = {
  handler: async (ctx) => {
    const { gameId } = ctx.getGame();
    const userId = ctx.getOptionValue("player") as string;

    return {
      bot: async () => {
        return !!ctx.getPlayers().find((p) => p.userId === userId)
          ? genericResult(`already added <@${userId}>`)
          : {
              mutations: [ctx.enqueueBot()],
              response: genericResponse(`added <@${userId}>`),
            };
      },
      consumer: async () => {
        return {
          mutations: [
            ctx.model.entities.PlayerEntity.create({
              gameId,
              userId,
              color: "",
            }).go(),
          ],
          response: {},
        };
      },
    };
  },
};

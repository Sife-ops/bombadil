import { Command } from "@bombadil/bot/runner";
import { building } from "./building";

export const stlmnt: Command = {
  handler: async (ctx) => ({
    bot: building(ctx, "city"),
    consumer: async () => {
      return;
    },
  }),
};

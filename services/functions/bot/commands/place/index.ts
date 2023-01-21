import * as subcommands from "./subcommands";
import { runner, Command } from "@bombadil/bot/runner";
import { genericResult } from "@bombadil/bot/common";

export const place: Command = {
  handler: async (ctx) => {
    return {
      bot: async () => {
        if (
          ctx.getRound() < 2 &&
          !["stlmnt", "road"].includes(ctx.getCommandName(1))
        ) {
          return genericResult("can only place settlement or road");
        }

        return runner(subcommands, ctx.getCommandName(1), ctx);
      },
      consumer: async () => {
        return runner(subcommands, ctx.getCommandName(1), ctx);
      },
    };
  },
};

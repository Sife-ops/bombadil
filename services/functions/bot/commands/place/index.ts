import * as subcommands from "./subcommands";
import { runner, Command } from "@bombadil/bot/runner";
import { genericResponse } from "@bombadil/bot/common";

export const place: Command = {
  handler: async (ctx) => {
    if (
      ctx.getRound() < 2 &&
      !["stlmnt", "road"].includes(ctx.getCommandName(1))
    ) {
      return genericResponse("can only place settlement or road");
    }

    return await runner(subcommands, ctx.getCommandName(1), ctx);
  },
};

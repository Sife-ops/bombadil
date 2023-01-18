import * as subcommands from "./subcommands";
import { genericResponse } from "@bombadil/bot/common";
import { runner, Command } from "@bombadil/bot/runner";

export const game: Command = {
  handler: async (ctx) => {
    const subcommandName = ctx.getCommandName(1);

    if (["add", "remove", "start", "cancel"].includes(subcommandName)) {
      if (!ctx.hasGame()) {
        return genericResponse("game does not exist");
      } else if (ctx.getGame().userId !== ctx.getUserId()) {
        return genericResponse("you are not the organizer");
      } else if (
        ["add", "remove", "start"].includes(subcommandName) &&
        ctx.getGame().started
      ) {
        return genericResponse("game already started");
      }
    }

    return await runner(subcommands, subcommandName, ctx);
  },
};

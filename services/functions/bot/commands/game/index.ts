import * as subcommands from "./subcommands";
import { runnerResponse } from "@bombadil/bot/common";
import { runner, Command } from "@bombadil/bot/runner";

export const game: Command = {
  handler: async (ctx) => {
    const subcommandName = ctx.getCommandName(1);
    return {
      bot: async () => {
        if (["add", "remove", "start", "cancel"].includes(subcommandName)) {
          if (!ctx.hasGame()) {
            return runnerResponse("game does not exist");
          } else if (ctx.getGame().userId !== ctx.getUserId()) {
            return runnerResponse("you are not the organizer");
          } else if (
            ["add", "remove", "start"].includes(subcommandName) &&
            ctx.getGame().started
          ) {
            return runnerResponse("game already started");
          }
        }

        return runner(subcommands, subcommandName, ctx);
      },
      consumer: () => {
        return runner(subcommands, subcommandName, ctx);
      },
    };
  },
};

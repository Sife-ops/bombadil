import * as commands from "./commands";
import { Ctx } from "./ctx";
import { runner } from "./runner";

export const handler = async (event: any) => {
  const ctx = await Ctx.init(JSON.parse(event.Records[0].body));
  await runner(commands, ctx.getCommandName(0), ctx);
};

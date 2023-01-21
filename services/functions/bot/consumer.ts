import * as commands from "./commands";
import { Ctx } from "./ctx";
import { runner } from "./runner";

export const handler = async (event: any) => {
  try {
    const ctx = await Ctx.init(JSON.parse(event.Records[0].body));
    const result = await runner(commands, ctx.getCommandName(0), ctx);

    await Promise.all([
      ...(result ? result.mutations : []),
    ]);
    await Promise.all(ctx.allMessages({ action: "update" }));
  } catch (e) {
    console.log(e);
    return;
  }
};

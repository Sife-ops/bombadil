import { Ctx } from "./ctx";
import { z } from "zod";

export type CommandHandler = (ctx: Ctx) => Promise<any>;

export interface Command {
  schema?: z.AnyZodObject | undefined;
  handler: CommandHandler;
}

export const runner = async (
  commands: Record<string, Command>,
  commandName: string,
  ctx: Ctx
) => {
  const command = commands[commandName];

  if (command.schema) {
    command.schema.parse(ctx.body);
  }

  return command.handler(ctx);
};

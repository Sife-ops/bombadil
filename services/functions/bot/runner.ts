import { Ctx } from "./ctx";
import { z } from "zod";

type CommandResult = {
  mutations: Array<Promise<any>>;
  response: Record<string, any>;
} | void;

export type CommandHandler = (ctx: Ctx) => Promise<{
  bot: () => Promise<CommandResult>;
  consumer: () => Promise<CommandResult>;
}>;

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

  const h = await command.handler(ctx);
  return h[ctx.handlerType]();
};

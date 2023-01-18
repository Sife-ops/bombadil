import { Command } from "@bombadil/bot/runner";
import { building } from "./building";

export const stlmnt: Command = {
  handler: building("settlement"),
};

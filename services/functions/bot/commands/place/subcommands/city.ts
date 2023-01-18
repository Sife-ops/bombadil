import { Command } from "@bombadil/bot/runner";
import { building } from "./building";

export const city: Command = {
  handler: building("city"),
};

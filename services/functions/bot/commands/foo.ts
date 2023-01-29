import { Command } from "../runner";
import { genericResult } from "@bombadil/bot/common";

export const foo: Command = {
  handler: async () => {
    return {
      bot: async () => {
        return genericResult("bar");
      },
      consumer: async () => {
        return;
      },
    };
  },
};

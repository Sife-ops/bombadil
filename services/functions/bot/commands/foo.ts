import { Command } from "../runner";
import { genericResponse, genericResult } from "@bombadil/bot/common";

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

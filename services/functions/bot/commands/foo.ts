import { Command } from "../runner";
import { genericResponse } from "@bombadil/bot/common";

export const foo: Command = {
  handler: async (ctx) => {
    return genericResponse("bar");
  },
};

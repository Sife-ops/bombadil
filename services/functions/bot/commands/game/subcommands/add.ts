import {
  genericResponse,
  getResolvedUser,
  usersSchema,
} from "@bombadil/bot/common";

import { Command } from "@bombadil/bot/runner";
import { Queue } from "@serverless-stack/node/queue";
import { model } from "@bombadil/core/model";
import { z } from "zod";

const schema = z.object({
  data: z.object({
    resolved: z.object({
      users: usersSchema,
    }),
  }),
});
type Schema = z.infer<typeof schema>;

export const add: Command = {
  schema,
  handler: async (ctx) => {
    const body: Schema = ctx.body;
    const { gameId } = ctx.getGame();
    const userId = ctx.getOptionValue("player") as string;

    if (!!ctx.getPlayers().find((p) => p.userId === userId)) {
      return genericResponse("already added");
    }

    await Promise.all([
      ctx.service.sqs
        .sendMessage({
          QueueUrl: Queue.onboardQueue.queueUrl,
          MessageBody: JSON.stringify(
            getResolvedUser(body.data.resolved.users, userId)
          ),
        })
        .promise(),

      model.entities.PlayerEntity.create({ gameId, userId }).go(),
    ]);

    return genericResponse("added player");
  },
};

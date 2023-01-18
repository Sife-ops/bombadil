import {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
  Handler,
} from "aws-lambda";

import * as commands from "./commands";
import AWS from "aws-sdk";
import nacl from "tweetnacl";
import { eventSchema, genericResponse } from "./common";
import { runner } from "@bombadil/bot/runner";
import { Ctx } from "./ctx";
import { Config } from "@serverless-stack/node/config";
import { Queue } from "@serverless-stack/node/queue";

// todo: add to ctx?
const sqs = new AWS.SQS();

export const handler: Handler<
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2
> = async (event) => {
  try {
    const parsedEvent = eventSchema.parse(event);
    const body = JSON.parse(parsedEvent.body);

    switch (body.type) {
      case 1: {
        const verified = nacl.sign.detached.verify(
          Buffer.from(
            parsedEvent.headers["x-signature-ed25519"] + parsedEvent.body
          ),
          Buffer.from(parsedEvent.headers["x-signature-timestamp"], "hex"),
          Buffer.from(Config.BOT_PUBLIC_KEY, "hex")
        );

        if (!verified) {
          throw new Error("verification failed");
        } else {
          return {
            statusCode: 200,
            body: parsedEvent.body,
          };
        }
      }

      case 2: {
        const ctx = await Ctx.init(body);

        const commandName = ctx.getCommandName(0);
        if (!["game"].includes(commandName)) {
          try {
            const { started, playerIndex } = ctx.getGame();
            if (!started) throw new Error("game not started");
            if (ctx.getPlayer().playerIndex !== playerIndex) {
              throw new Error("not your turn");
            }
            if (ctx.getRound() < 2 && !["place", "end"].includes(commandName)) {
              throw new Error("not allowed");
            }
          } catch (e: any) {
            return genericResponse(e.message);
          }
        }

        const [run] = await Promise.all([
          runner(commands, commandName, ctx),
          sqs
            .sendMessage({
              QueueUrl: Queue.onboardQueue.queueUrl,
              MessageBody: JSON.stringify(body.member.user),
            })
            .promise(),
        ]);

        return run;
      }

      default: {
        throw new Error("unknown request type");
      }
    }
  } catch (e) {
    console.log(e);
    return {
      statusCode: 401,
    };
  }
};

import { Command } from "@bombadil/bot/runner";
import { Config } from "@serverless-stack/node/config";
import { StaticSite } from "@serverless-stack/node/site";
import { genericResult } from "@bombadil/bot/common";

export const create: Command = {
  handler: async (ctx) => {
    return {
      bot: async () => {
        const { MapEntity, GameEntity, PlayerEntity } = ctx.model.entities;
        const userId = ctx.getUserId();
        const channelId = ctx.getChannelId();

        /**
         * 1) one game per channel
         * 2) map must exist
         * 3) create game
         */

        // 1) one game per channel
        if (ctx.hasGame()) {
          return genericResult("game already exists");
        }

        // 2) map must exist
        const map = await MapEntity.query
          .map({ mapId: ctx.getOptionValue("map") as string })
          .go()
          .then(({ data }) => data[0]?.data);

        if (!map) {
          return genericResult("map does not exist");
        }

        // 3) create game
        const gameId = await GameEntity.create({
          channelId,
          map,
          userId,
        })
          .go()
          .then(({ data }) => data.gameId);

        return {
          mutations: [
            PlayerEntity.create({
              gameId,
              userId,
              color: "",
            }).go(),
          ],
          response: {
            type: 4,
            data: {
              content: "game created",
              embeds: [
                {
                  title: "game url",
                  url: `${
                    Config.STAGE.split("-").includes("local")
                      ? "http://localhost:3000"
                      : StaticSite.site.url
                  }/game/${gameId}`,
                  color: 0xff0000,
                },
              ],
            },
          },
        };
      },
      consumer: async () => {
        return;
      },
    };
  },
};

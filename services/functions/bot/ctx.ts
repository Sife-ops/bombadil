import AWS from "aws-sdk";
import { GameCollection, model } from "@bombadil/core/model";
import { Queue } from "@serverless-stack/node/queue";
import { WebSocketApi } from "@serverless-stack/node/api";
import { onboardUser, OptionSchema } from "./common";

import {
  Coords,
  CoordsPair,
  adjXY,
  compareXY,
  compareXYPair,
} from "@bombadil/lib";

const sqs = new AWS.SQS();
const wsApi = new AWS.ApiGatewayManagementApi({
  endpoint: WebSocketApi.webSocketApi.url.split("wss://")[1],
});

export class Ctx {
  interactionBody;
  interactionResult;
  gameCollection;
  handlerType;
  service;

  private constructor(c: {
    interactionBody: any;
    interactionResult?: Partial<GameCollection>;
    gameCollection?: GameCollection;
  }) {
    this.interactionBody = c.interactionBody;
    this.interactionResult = c.interactionResult;
    this.gameCollection = c.gameCollection;
    this.handlerType = process.env.HANDLER_TYPE as "bot" | "consumer";
    this.service = {
      sqs,
      wsApi,
    };
  }

  static async init({
    interactionBody,
    interactionResult,
  }: {
    interactionBody: any;
    interactionResult?: Partial<GameCollection>;
  }) {
    const gameCollection = await model.entities.GameEntity.query
      .channel({ channelId: interactionBody.channel_id })
      .where(({ winner }, { notExists }) => notExists(winner))
      .go()
      .then(({ data }) => data[0])
      .then((game) => {
        if (!game) return undefined;
        return model.collections
          .game({ gameId: game.gameId })
          .go()
          .then((e) => e.data);
      });

    return new Ctx({
      interactionBody,
      interactionResult,
      gameCollection,
    });
  }

  // body
  getChannelId(): string {
    return this.interactionBody.channel_id;
  }

  getUser() {
    return this.interactionBody.member.user;
  }

  getUserId(): string {
    return this.getUser().id;
  }

  // options
  getFlatOptions(): OptionSchema[][] {
    const recurse = (options: OptionSchema[]): OptionSchema[][] => {
      if (!options || options.length < 1) return [];
      const firstOption = options[0];
      if (firstOption.options && firstOption.options.length > 0) {
        return [[firstOption], ...recurse(firstOption.options)];
      }
      return [options];
    };

    const {
      data: { name, options, type },
    } = this.interactionBody;

    return [
      [
        {
          name,
          options,
          type,
        },
      ],
      ...recurse(options),
    ];
  }

  getCommandName(index: number) {
    return this.getFlatOptions()[index][0].name;
  }

  getOptionValue(optionName: string) {
    const flatOptions = this.getFlatOptions();
    const value = flatOptions[flatOptions.length - 1].find(
      (option) => option.name === optionName
    )?.value;
    if (!value) throw new Error(`option not found: "${optionName}"`);
    return value;
  }

  // game
  getGameCollection() {
    if (!this.gameCollection) throw new Error("missing gameCollection");
    return this.gameCollection;
  }

  hasGame() {
    return !!this.gameCollection;
  }

  getGame() {
    return this.getGameCollection().GameEntity[0];
  }

  getRound() {
    return this.getGame().round;
  }

  getMap() {
    // todo: explicit any
    return JSON.parse(this.getGame().map) as any[][];
  }

  getFlatMap() {
    return this.getMap()
      .map((row, iRow) =>
        row.map((col, iCol) => ({
          ...col,
          x: iCol,
          y: iRow,
        }))
      )
      .reduce((a, c) => {
        return [...a, ...c];
      }, []);
  }

  getMapAdjacent(type: string, coords: Coords) {
    const adj = adjXY(coords).map((offset) => ({
      x: coords.x + offset.x,
      y: coords.y + offset.y,
    }));

    return this.getFlatMap()
      .filter((c) => adj.find((cc) => compareXY(cc, c)))
      .filter((c) => c.type === type) as Coords[];
  }

  getMapIndex<T>(type: string, index: number): T | undefined {
    return this.getFlatMap().filter((e) => e.type === type)[index];
  }

  getMapIndexOrThrow<T>(type: string, index: number): T {
    const a = this.getMapIndex<T>(type, index);
    if (!a) throw new Error("todo");
    return a;
  }

  // player
  getPlayers() {
    return this.getGameCollection().PlayerEntity;
  }

  getPlayer(index?: number) {
    const player = this.getPlayers().find((player) => {
      if (typeof index === "number") {
        return player.playerIndex === index;
      } else {
        return player.userId === this.getUserId();
      }
    });
    if (!player) throw new Error("missing player");
    return player;
  }

  getResolvedUsers() {
    return this.interactionBody.data.resolved.users;
  }

  // road
  getRoads() {
    return this.getGameCollection().RoadEntity.map((road) => ({
      ...road,
      from: { x: road.x1, y: road.y1 },
      to: { x: road.x2, y: road.y2 },
    }));
  }

  getPlayerRoads() {
    return this.getRoads().filter(
      (road) => road.playerId === this.getPlayer().playerId
    );
  }

  hasRoad(r: CoordsPair) {
    return !!this.getRoads().find((road) => compareXYPair(road, r));
  }

  // building
  getBuildings() {
    return this.getGameCollection().BuildingEntity;
  }

  getPlayerBuildings() {
    return this.getBuildings().filter(
      (building) => building.playerId === this.getPlayer().playerId
    );
  }

  hasBuilding(b: Coords) {
    return !!this.getBuildings().find((building) => compareXY(building, b));
  }

  // websocket
  messageClient(connectionId: string, message: any) {
    return new Promise((resolve, reject) => {
      this.service.wsApi.postToConnection(
        {
          ConnectionId: connectionId,
          Data: JSON.stringify(message),
        },

        (err, data) => {
          if (err) {
            console.log("err is", err);
            reject(err);
          }

          resolve(data);
        }
      );
    });
  }

  allMessages(message: any) {
    try {
      return this.getGameCollection().ConnectionEntity.map(({ connectionId }) =>
        this.messageClient(connectionId, message)
      );
    } catch {
      return [];
    }
  }

  messageAll(message: any) {
    return Promise.all(this.allMessages(message));
  }

  // queue
  enqueueBot(message: Partial<GameCollection> = {}) {
    return this.service.sqs
      .sendMessage({
        QueueUrl: Queue.botQueue.queueUrl,
        MessageBody: JSON.stringify({
          interactionBody: this.interactionBody,
          interactionResult: message,
        }),
      })
      .promise();
  }

  // interactionResult
  getInteractionResult() {
    if (!this.interactionResult) throw new Error("missing interactionResult");
    return this.interactionResult;
  }

  getInteractionResultPlayers() {
    const { PlayerEntity } = this.getInteractionResult();
    if (!PlayerEntity) throw new Error("missing PlayerEntity");
    return PlayerEntity;
  }

  // onboard
  onboardMember() {
    return onboardUser(this.getUser());
  }

  onboardResolved() {
    try {
      const resolved = this.getResolvedUsers();
      return Object.keys(resolved)
        .map((key) => resolved[key])
        .map((user) => onboardUser(user));
    } catch {
      return [];
    }
  }

  onboardUsers() {
    return [this.onboardMember(), ...this.onboardResolved()];
  }
}

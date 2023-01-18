export const game = {
  name: "game",
  description: "game commands",
  options: [
    {
      name: "create",
      description: "create a game",
      type: 1,
      options: [
        {
          name: "map",
          description: "map ID",
          type: 3,
          required: true,
        },
      ],
    },

    {
      name: "add",
      description: "add a player",
      type: 1,
      options: [
        {
          name: "player",
          description: "player name",
          type: 6,
          required: true,
        },
      ],
    },

    {
      name: "remove",
      description: "remove a player",
      type: 1,
      options: [
        {
          name: "player",
          description: "player name",
          type: 6,
          required: true,
        },
      ],
    },

    {
      name: "start",
      description: "start game",
      type: 1,
    },

    {
      name: "cancel",
      description: "cancel game",
      type: 1,
    },
  ],
};

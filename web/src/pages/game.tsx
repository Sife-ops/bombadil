import { useGame } from "./game-hook";

export const Game = () => {
  const game = useGame();

  return (
    <div>
      <div>{game.gameId}</div>
      <div>
        <svg
          viewBox="0 0 120 150"
          style={{
            width: "600px",
          }}
        >
          <g transform="translate(10, 10)">
            {game.hexes}
            {game.chits}
            {game.harbors}
          </g>
        </svg>
      </div>
    </div>
  );
};

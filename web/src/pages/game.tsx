import { useGame } from "./game-hook";

export const Game = () => {
  const game = useGame();

  return (
    <div>
      <div>
        <svg
          viewBox="0 0 120 130"
          style={{
            width: "600px",
            // height: "600px"
          }}
        >
          <g transform="translate(10, 10)">
            {game.hexes}
            {game.chits}
            {game.robbers}
            {game.jetties}
            {game.harbors}
            {game.roads}
            {game.settlements}
          </g>
        </svg>
      </div>
      <div>
        <div>players:</div>
        {game.players}
      </div>
    </div>
  );
};

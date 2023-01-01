import { useState, useEffect } from "react";
import Board from "./components/Board";
import Bar from "./components/Bar";
import { toast } from "react-hot-toast";
import Piece from "./components/Piece";
import "./App.css";
import { initialState } from "./logic";

// https://salamdonya.com/fun/how-to-play-backgammon

function App() {
  const [game, setGame] = useState({
    board: initialState,
    dice: [],
    turn: 1,
  });

  useEffect(() => {
    if (game.dice.length == 2) {
      toast(game.dice[0]);
      toast(game.dice[1]);
    }
  }, [game.dice]);

  function rollDice() {
    const first = Math.floor(Math.random() * 6) + 1;
    const second = Math.floor(Math.random() * 6) + 1;
    let temp = { ...game };
    temp.dice = [first, second];
    setGame(temp);
  }

  function checkState(from, to) {
    const currBoard = [...board];

    // TODO

    setBoard(currBoard);
  }

  function select(index) {}

  return (
    <>
      <Board>
        {game.board.map((bar, barIdx) => (
          <Bar
            isTopRow={barIdx > 11}
            onClick={() => select(barIdx)}
            key={barIdx}
          >
            {bar.convertToArray().map((piece, pieceIdx) => (
              <Piece key={`${barIdx}-${pieceIdx}`} color={piece} />
            ))}
          </Bar>
        ))}
      </Board>
      <button onClick={rollDice}>🎲 Roll dice 🎲</button>
    </>
  );
}

export default App;

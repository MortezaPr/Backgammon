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

  const [white, setWhite] = useState({
    moves: [],
  });

  const [black, setBlack] = useState({
    moves: [],
  });

  // check game's states
  useEffect(() => {
    if (game.dice.length == 2) {
      toast(game.dice[0]);
      toast(game.dice[1]);
    }
  }, [game.dice]);

  // check white player's states
  useEffect(() => {
    if (white.moves.length == 2) {
      checkState(white.moves[0], white.moves[1]);
    }
  }, [white.moves]);

  // check black player's states
  useEffect(() => {
    if (black.moves.length == 2) {
      checkState(black.moves[0], black.moves[1]);
    }
  }, [black.moves]);

  // roll dice function, it will generate two random numbers between 1 and 6
  function rollDice() {
    const first = Math.floor(Math.random() * 6) + 1;
    const second = Math.floor(Math.random() * 6) + 1;
    let temp = { ...game };
    temp.dice = [first, second];
    setGame(temp);
  }

  function checkState(from, to) {
    let player = white;
    if (game.turn == -1) {
      player = black;
    }
    let temp = { ...game };
    let thePiece = temp.board[from].pop();
    temp.board[to].push(thePiece);
    setGame(temp);
    player.moves = [];

    // const currBoard = [...board];
    // // TODO
    // setBoard(currBoard);
  }

  // select bar function, it will select the bar player clicked on
  function select(index) {
    let player = white;
    if (game.turn == -1) {
      player = black;
    }
    // check if the first selected bar is empty
    if (game.board[index].top() == undefined && player.moves.length == 0) {
      toast.error("There Is No Piece In This Place");
    } else {
      let temp = { ...player };
      temp.moves = [...player.moves, index];
      if (player == white) {
        setWhite(temp);
      } else {
        setBlack(temp);
      }
    }
  }

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

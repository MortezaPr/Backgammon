import { useState, useEffect } from "react";
import Board from "./components/Board";
import Bar from "./components/Bar";
import { toast } from "react-hot-toast";
import Piece from "./components/Piece";
import "./App.css";
import { initialState } from "./logic";

// https://salamdonya.com/fun/how-to-play-backgammon

function App() {
  const [dice, setDice] = useState([]);
  const [board, setBoard] = useState(initialState);
  const [turn, setTurn] = useState(1);

  const [player, setPlayer] = useState({
    selectedBars: [],
    availableMoves: [],
  });

  // roll dice function, it will generate two random numbers between 1 and 6
  function rollDice() {
    const first = Math.floor(Math.random() * 6) + 1;
    const second = Math.floor(Math.random() * 6) + 1;
    let dices = [first, second];
    if (first == second) {
      dices.push(first);
      dices.push(second);
    }

    setDice(dices);
  }

  function calculateAvailableMoves() {
    const from = player.selectedBars[0];
    let dest1 = from - dice[0];
    let dest2 = from - dice[1];
    let dest3 = from - (dice[0] + dice[1]);
    if (turn == 1) {
      if (dest1 < 0) dest1 = 11 - dest1;

      if (dest2 < 0) dest2 = 11 - dest2;

      if (dest3 < 0) dest3 = 11 - dest3;
    } else {
      if (dest1 < 12) dest1 = 11 - dest1;

      if (dest2 < 12) dest2 = 11 - dest2;

      if (dest3 < 12) dest3 = 11 - dest3;
    }

    const destinations = [dest1, dest2, dest3];
    const available = [];
    let color = "white";
    if (turn == -1) color = "black";

    destinations.forEach((dest) => {
      if (!isNaN(dest)) {
        if (board[dest].top() == color || board[dest].top() == undefined) {
          available.push(dest);
        } else if (board[dest].length() == 1) {
          available.push(dest);
        }
      }
    });
    let temp = { ...player };
    temp.availableMoves = available;
    setPlayer(temp);
  }

  function movement() {
    const from = player.selectedBars[0];
    const to = player.selectedBars[1];
    const moves = player.availableMoves;
    // check if from and to are the same, check if the destination is available for the player
    if (from == to) {
      toast("Canceled");
    } else if (!moves.includes(to)) {
      toast.error("You can't do this");
    } else {
      // update the board
      let thePiece = board[from].pop();
      board[to].push(thePiece);

      // update player
      let p = { ...player };

      p.availableMoves.pop();
      const index = p.availableMoves.indexOf(to);
      if (index > -1) {
        p.availableMoves.splice(index, 1);
      }
      setPlayer(p);

      // update dice
      let d = [...dice];
      const diceNum = from - to;
      const din = d.indexOf(diceNum);
      if (din > -1) {
        d.splice(index, 1);
      }
      setDice(d);
      if (d == 0) {
        setTurn((prev) => prev * -1);
      }
    }

    let temp = { ...player };
    temp.selectedBars = [];
    setPlayer(temp);
  }

  // select bar function, it will select the bar player clicked on
  function select(index) {
    // check if dice has been rolled
    if (dice.length == 0) return toast.error("You must roll the dice first!");

    // check for the right player
    if (
      (turn == 1 &&
        board[index].top() == "black" &&
        player.selectedBars.length == 0) ||
      (turn == -1 &&
        board[index].top() == "white" &&
        player.selectedBars.length == 0)
    )
      return toast.error("It's not your turn!");

    // check if the first selected bar is empty
    if (board[index].top() === undefined && player.selectedBars.length == 0)
      return toast.error("There Is No Piece In This Place");

    let temp = { ...player };
    temp.selectedBars.push(index);
    setPlayer(temp);

    if (player.selectedBars.length == 1) calculateAvailableMoves();

    if (player.selectedBars.length == 2) movement();
  }

  return (
    <>
      <Board>
        {board.map((bar, barIdx) => (
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
      <div className="dice">
        {dice.length > 0 ? `Dice Numbers: ${dice[0]} , ${dice[1]}` : ""}
      </div>
    </>
  );
}

export default App;

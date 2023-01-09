import { useState, useEffect } from "react";
import Board from "./components/Board";
import Bar from "./components/Bar";
import Dice from "./components/Dice";
import { toast } from "react-hot-toast";
import Piece from "./components/Piece";
import "./App.css";
import { initialState } from "./logic";

function App() {
  const [game, setGame] = useState({
    dice: [],
    board: initialState,
    turn: 1,
    blackHits: [],
    whiteHits: [],
    blackOut: 0,
    whiteOut: 0,
  });

  const [player, setPlayer] = useState({
    selectedBars: [],
    moves: [],
    isOut: false,
  });

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  function isWhiteTurn() {
    if (game.turn === 1) return true;
    return false;
  }

  function isBlackTurn() {
    if (game.turn === -1) return true;
    return false;
  }

  function getColor() {
    let color = "white";
    if (game.turn == -1) color = "black";
    return color;
  }

  // roll dice function, it will generate two random numbers between 1 and 6
  function rollDice() {
    if (game.dice.length > 0) return toast.error("You can't roll the dice!");
    let tempGame = { ...game };

    var first = Math.floor(Math.random() * 6) + 1;
    var second = Math.floor(Math.random() * 6) + 1;

    let dices = [first, second];
    if (first == second) {
      dices.push(first);
      dices.push(second);
    }
    tempGame.dice = dices;
    setGame(tempGame);

    // check if the player can play
    checkOutState(dices);
  }

  function checkOutState(dices) {
    if (isWhiteTurn() && game.whiteHits.length > 0) {
      entering(dices);
    } else if (isBlackTurn() && game.blackHits.length > 0) {
      entering(dices);
    }
  }

  async function entering(dices) {
    console.log("Entering");
    // calculate the possible places where the player can move with the given dice numbers
    let possiblePlaces = [];
    if (isWhiteTurn()) {
      let availablePlaces = [6, 7, 8, 9, 10, 11];
      availablePlaces.forEach((place) => {
        if (place == 12 - dices[0]) {
          possiblePlaces.push(place);
        } else if (place == 12 - dices[1]) {
          possiblePlaces.push(place);
        }
      });
    } else {
      let availablePlaces = [18, 19, 20, 21, 22, 23];
      availablePlaces.forEach((place) => {
        if (place == 24 - dices[0]) {
          possiblePlaces.push(place);
        } else if (place == 24 - dices[1]) {
          possiblePlaces.push(place);
        }
      });
    }

    // check if possible places are available (are not full by other player)
    const result = getAvailablePlaces(possiblePlaces, getColor());
    if (result != undefined) {
      let temp = { ...player };
      temp.moves = result;
      setPlayer(temp);
    } else {
      await delay(3000);
      toast.error("You can't play");
      setDice([]);
      setTurn((prev) => prev * -1);
    }
  }

  function getAvailablePlaces(places, color) {
    let available = [];
    places.forEach((place) => {
      if (
        game.board[place].top() == color ||
        game.board[place].top() == undefined
      ) {
        available.push(place);
      } else if (game.board[place].length() == 1) {
        available.push(place);
      }
    });

    // if there is no available places return undefined
    if (available.length == 0) {
      setDice([]);
      return undefined;
    } else {
      return available;
    }
  }

  function getDestinations() {
    const from = player.selectedBars[0];
    let destinations = [];
    let temp = [];
    if ((from <= 11 && isWhiteTurn()) || (from > 11 && isBlackTurn())) {
      if (game.dice[0] === game.dice[1]) {
        let des = from - game.dice[0];
        game.dice.forEach((d) => {
          temp.push(des);
        });
        destinations = checkDestinations(temp, from);
      } else {
        let des1 = from - game.dice[0];
        let des2 = from - game.dice[1];
        let des3 = from - (game.dice[0] + game.dice[1]);
        temp = [des1, des2, des3];
        destinations = checkDestinations(temp, from);
      }
      return destinations;
    } else if (
      (from <= 11 && game.turn == -1) ||
      (from > 11 && game.turn == 1)
    ) {
      let movesState = [];
      // doubles
      if (game.dice[0] === game.dice[1]) {
        let des = from + game.dice[0];
        movesState = [des, des, des, des];
      } else {
        const d1 = from + game.dice[0];
        const d2 = from + game.dice[1];
        const d3 = from + (game.dice[0] + game.dice[1]);
        movesState = [d1, d2, d3];
      }
      destinations = movesState;

      if (isWhiteTurn() && game.whiteHits.length == 0) {
        const count = countPieceNumbers();
        if (count == 15 - game.whiteOut) {
          for (let i = 0; i < movesState.length; i++) {
            if (movesState[i] >= 24) {
              destinations[i] = -1;
            }
          }
        }
      } else if (isBlackTurn() && game.blackHits.length == 0) {
        const count = countPieceNumbers();
        if (count == 15 - game.blackOut) {
          for (let i = 0; i < movesState.length; i++) {
            if (movesState[i] >= 12) {
              destinations[i] = -1;
            }
          }
        }
      }
      return destinations;
    }
  }

  function countPieceNumbers() {
    let places = [];
    let count = 0;
    if (isWhiteTurn()) {
      places = [18, 19, 20, 21, 22, 23];
    } else {
      places = [6, 7, 8, 9, 10, 11];
    }
    places.forEach((index) => {
      if (game.board[index].top() === getColor())
        count += game.board[index].length();
    });
    return count;
  }

  function checkDestinations(destinations, from) {
    if (from <= 11 && game.turn == 1) {
      let res = [];
      destinations.forEach((dest) => {
        if (dest < 0) {
          dest = -dest + 11;
        }
        res.push(dest);
      });
      return res;
    } else if (from > 11 && game.turn == -1) {
      let res = [];
      destinations.forEach((dest) => {
        if (dest < 12) {
          dest = 11 - dest;
        }
        res.push(dest);
      });
      return res;
    }
  }

  function availableMoves() {
    const destinations = getDestinations();
    const available = [];
    let color = getColor();

    destinations.forEach((dest) => {
      if (!isNaN(dest) && dest != -1) {
        if (
          game.board[dest].top() == color ||
          game.board[dest].top() == undefined
        ) {
          available.push(dest);
        } else if (game.board[dest].length() == 1) {
          available.push(dest);
        }
      } else if (dest == -1) {
        available.push(dest);
        setIsOut(true);
      }
    });
    let temp = { ...player };
    temp.moves = available;
    setPlayer(temp);
  }

  async function movement(isEntering) {
    let from;
    let to;

    if (player.selectedBars.length === 1) {
      if (isWhiteTurn()) {
        from = 11;
      } else {
        from = 23;
      }
      to = player.selectedBars[0];
    } else {
      from = player.selectedBars[0];
      to = player.selectedBars[1];
    }
    const moves = player.moves;
    let color = getColor();
    console.log(moves);

    // check if from and to are the same, check if the destination is available for the player
    if (from == to && !isEntering) {
      toast("Canceled");
    } else if (!moves.includes(to)) {
      toast.error("You can't do this");
    } else {
      // update the board

      // check for hitting other player's piece
      if (game.board[to].length() == 1) {
        if (color == "white" && game.board[to].top() == "black") {
          game.blackHits.push(game.board[to].pop());
        } else if (color == "black" && game.board[to].top() == "white") {
          game.whiteHits.push(game.board[to].pop());
        }
      }

      if (isEntering) {
        if (color == "white") {
          game.whiteHits.pop();
        } else {
          game.blackHits.pop();
        }
        game.board[to].push(color);
      } else {
        game.board[to].push(game.board[from].pop());
      }

      // update player
      let p = { ...player };

      const index = p.moves.indexOf(to);
      if (index > -1) {
        p.moves.splice(index, 1);
      }

      setPlayer(p);

      // update dice
      updateDice(from, to, isEntering);
    }

    if (player.moves.length === 0) {
      if (isWhiteTurn() && game.whiteHits.length > 0) {
        await delay(1500);
        toast.error("You can't play");
        setDice([]);
        setTurn((prev) => prev * -1);
      } else if (isBlackTurn() && game.blackHits.length > 0) {
        await delay(1500);
        toast.error("You can't play");
        setDice([]);
        setTurn((prev) => prev * -1);
      }
    }

    // free the selected bars
    let p = { ...player };
    p.selectedBars = [];
    setPlayer(p);
  }

  function updateDice(from, to, isEntering) {
    let tempGame = { ...game };
    let diceNum;
    if ((from <= 11 && game.turn == 1) || (from > 11 && game.turn == -1)) {
      diceNum = from - to;
      if (isEntering) {
        diceNum += 1;
      }
      if (diceNum < 0) {
        diceNum = to - (11 - from);
      } else if (diceNum > 6) {
        diceNum = from - (11 - to);
      }
    } else if (
      (from <= 11 && game.turn == -1) ||
      (from > 11 && game.turn == 1)
    ) {
      diceNum = to - from;
    }

    const din = tempGame.dice.indexOf(diceNum);
    if (din > -1) {
      tempGame.dice.splice(din, 1);
    }
    if (tempGame.dice.length == 0) {
      tempGame.turn = tempGame.turn * -1;
    }
    setGame(tempGame);
  }

  function pieceOut() {
    const from = player.selectedBars[0];
    let tempGame = { ...game };
    let tempPlayer = { ...player };
    game.board[from].pop();
    if (isWhiteTurn()) {
      tempGame.whiteOut = tempGame.whiteOut + 1;
    } else {
      tempGame.blackOut = tempGame.blackOut + 1;
    }
    // updating dice and player state for getting pieces out the game

    if (game.dice[0] != game.dice[1] && game.dice.length > 1) {
      let index = tempPlayer.moves.indexOf(-1);
      if (tempPlayer.moves.length == 3 && index < 2) {
        tempPlayer.moves.pop();
        tempPlayer.moves.splice(index, 1);
        tempGame.dice.splice(index, 1);
        setGame(tempGame);
      } else if (tempPlayer.moves.length == 3 && index == 2) {
        tempPlayer.moves = [];
        tempGame.dice = [];
        setGame(tempGame);
      } else if (tempPlayer.moves.length == 1) {
        tempPlayer.moves = [];
        tempGame.dice = [];
        setGame(tempGame);
      }
      tempPlayer.selectedBars = [];
      // setPlayer(tempPlayer);
    } else {
      let temp = { ...player };
      temp.moves.pop();
      temp.selectedBars = [];
      tempGame.dice.pop();
      // setPlayer(temp);
      setGame(tempGame);
    }
    if (d.length === 0) {
      tempGame.turn = tempGame.turn * -1;
      setGame(tempGame.turn);
    }
    tempPlayer.isOut = false;
    setPlayer(tempPlayer);
  }

  // this function gets the bar's index that the player clicked on
  function select(index) {
    if (game.whiteHits.length > 0 && isWhiteTurn()) {
      let temp = { ...player };
      temp.selectedBars.push(index);
      setPlayer(temp);
      movement(true);
    } else if (game.blackHits.length > 0 && isBlackTurn()) {
      let temp = { ...player };
      temp.selectedBars.push(index);
      setPlayer(temp);
      movement(true);
    } else {
      // check if dice has been rolled
      if (game.dice.length == 0)
        return toast.error("You must roll the dice first!");

      // check for player's turn to be correct, and check if the first selected bar is empty
      if (player.selectedBars.length == 0) {
        if (isWhiteTurn() && game.board[index].top() === "black") {
          return toast.error("It's not your turn!");
        } else if (isBlackTurn() && game.board[index].top() === "white") {
          return toast.error("It's not your turn!");
        } else if (game.board[index].top() === undefined) {
          return toast.error("There Is No Piece In This Place");
        }
      }

      let temp = { ...player };
      temp.selectedBars.push(index);
      setPlayer(temp);

      if (player.selectedBars.length == 1) availableMoves();

      if (player.selectedBars.length == 2) movement(false);
    }
  }

  function showDice() {
    let str = "Dice Numbers:";
    let d1 = "";
    let d2 = "";
    if (game.dice[0] != undefined) {
      d1 = game.dice[0].toString();
    }
    if (game.dice[1] != undefined) {
      d2 = game.dice[1].toString();
    }

    if (d1 != "") {
      str = `${str} ${d1}`;
    }
    if (d2 != "") {
      if (str.indexOf(" ") >= 0) {
        str = `${str} ,`;
      }
      str = `${str} ${d2}`;
    }
    return str;
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
      <div className="container">
        <Dice dice={game.dice[0]} />
        <Dice dice={game.dice[1]} />
      </div>
      <button onClick={rollDice}>🎲 Roll dice 🎲</button>
      {game.isOut ? <button onClick={pieceOut}>Out</button> : ""}
      <div className="dice">{game.dice.length > 0 ? showDice() : ""}</div>
    </>
  );
}

export default App;

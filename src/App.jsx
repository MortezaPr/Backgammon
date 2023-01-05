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
  const [blackOut, setBlackOut] = useState([]);
  const [whiteOut, setWhiteOut] = useState([]);

  const [player, setPlayer] = useState({
    selectedBars: [],
    moves: [],
  });


  function isWhiteTurn() {
    if (turn === 1) return true
    return false
  }


  function isBlackTurn() {
    if (turn === -1) return true
    return false
  }


  function getColor() {
    let color = "white";
    if (turn == -1) color = "black";
    return color
  }


  // roll dice function, it will generate two random numbers between 1 and 6
  function rollDice() {
    if (dice.length > 0) return toast.error("You can't roll the dice!");

    const first = Math.floor(Math.random() * 6) + 1;
    const second = Math.floor(Math.random() * 6) + 1;

    let dices = [first, second];

    // If a player rolls two of the same number (doubles)
    if (first == second) {
      dices.push(first);
      dices.push(second);
    }
    setDice(dices);

    // check if the player can play 
    if (isWhiteTurn() && whiteOut.length > 0) {
      entering(dices);
    } else if (isBlackTurn() && blackOut.length > 0) {
      entering(dices);
    }
  }


  function entering(dices) {
    
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
      toast.error("You can't play");
    }
  }


  function getAvailablePlaces(places, color) {

    let available = [];
    places.forEach((place) => {
      if (board[place].top() == color || board[place].top() == undefined) {
        available.push(place);
      } else if (board[place].length() == 1) {
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
    let destinations = []
    let temp = []
    if (from <= 11 && isWhiteTurn() || (from > 11 && isBlackTurn())) {
      if (dice[0] === dice[1]) {
        let des = from - dice[0]
        dice.forEach((d) => {
          temp.push(des)
        })
        destinations = checkDests(temp, from)
      } else {
        let des1 = from - dice[0]
        let des2 = from - dice[1]
        temp = [des1, des2]
        destinations = checkDests(temp, from)
      }
      return destinations
    } else if ((from <= 11 && turn == -1) || (from > 11 && turn == 1)) {
      destinations.push(from + dice[0]);
      destinations.push(from + dice[1]);
      destinations.push(from + (dice[0] + dice[1]));
      return destinations
      // TODO
    }
  }


  function checkDests(dests, from) {
    if ((from <= 11 && turn == 1)) {
      let res = []
      dests.forEach((dest) => {
        if (dest < 0) {
          dest = -dest + 11;
        } 
        res.push(dest)
      })
      return res
    } else if (from > 11 && turn == -1) {
      dests.forEach((dest) => {
        if (dest < 12) {
          dest = 11 - dest;
        }
        res.push(dest)
      })
      return res
    } else if (from <= 11 && turn == -1) {
      // TODO
    } else if (from > 11 && turn == 1) {
      // TODO
    }
  }


  function availableMoves() {

    const destinations = getDestinations();
    const available = [];
    let color = getColor()

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
    temp.moves = available;
    setPlayer(temp);
  }


  function movement(isEntering) {

    let from;
    let to;

    if (player.selectedBars.length === 1) {
      if (isWhiteTurn()) {
        from = 11 
      } else {
        from = 23
      }
      to = player.selectedBars[0];
    } else {
      from = player.selectedBars[0];
      to = player.selectedBars[1]; 
    }
    const moves = player.moves; 
    let color = getColor()


    // check if from and to are the same, check if the destination is available for the player
    if (from == to && !isEntering) {
      toast("Canceled");
    } else if (!moves.includes(to)) {
      toast.error("You can't do this");
    } else {
      // update the board

      // check for hitting other player's piece
      if (board[to].length() == 1) {
        if (color == "white" && board[to].top() == "black") {
          blackOut.push(board[to].pop());
        } else if (color == "black" && board[to].top() == "white") {
          whiteOut.push(board[to].pop());
        }
      }


      if (isEntering) {
        board[to].push(color);
      } else {
        board[to].push(board[from].pop());
      }


      // update player
      let p = { ...player };

      let del = p.moves.pop();
      if (del != to) {
        const index = p.moves.indexOf(to);
        if (index > -1) {
          p.moves.splice(index, 1);
        }
      }

      setPlayer(p);


      // update dice
      let d = [...dice];
      let diceNum;
      if ((from <= 11 && turn == 1) || (from > 11 && turn == -1)) {
        diceNum = from - to;
        if (isEntering) {
          diceNum += 1;
        }
        if (diceNum < 0) {
          diceNum = to - (11 - from);
        } else if (diceNum > 6) {
          diceNum = from - (11 - to);
        }
      } else if ((from <= 11 && turn == -1) || (from > 11 && turn == 1)) {
        diceNum = to - from;
      }
  
      const din = d.indexOf(diceNum);
      if (din > -1) {
        d.splice(din, 1);
      }
      setDice(d);
      if (d.length == 0) {
        setTurn((prev) => prev * -1);
      }
    }

    let temp = { ...player };
    temp.selectedBars = [];
    setPlayer(temp);
  }


  // this function gets the bar's index that the player clicked on
  function select(index) {

    if (whiteOut.length > 0 && isWhiteTurn()) {
      let temp = { ...player };
      temp.selectedBars.push(index);
      setPlayer(temp);
      movement(true);
    } else if (blackOut.length > 0 && isBlackTurn()) {
      let temp = { ...player };
      temp.selectedBars.push(index);
      setPlayer(temp);
      movement(true);
    } else {

      // check if dice has been rolled
      if (dice.length == 0) return toast.error("You must roll the dice first!");

      // check for player's turn to be correct, and check if the first selected bar is empty
      if ( player.selectedBars.length == 0) {
        if (isWhiteTurn() && board[index].top() === "black") {
          return toast.error("It's not your turn!");

        } else if (isBlackTurn() && board[index].top() === "white") {
          return toast.error("It's not your turn!");

        } else if (board[index].top() === undefined) {
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
    if (dice[0] != undefined) {
      d1 = dice[0].toString();
    }
    if (dice[1] != undefined) {
      d2 = dice[1].toString();
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
      <div className="dice">{dice.length > 0 ? showDice() : ""}</div>
    </>
  );
}

export default App;

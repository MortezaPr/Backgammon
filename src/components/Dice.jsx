import "./dice.css";
import DiceImage1 from "../images/Alea_a1.png";
import DiceImage2 from "../images/Alea_a2.png";
import DiceImage3 from "../images/Alea_a3.png";
import DiceImage4 from "../images/Alea_a4.png";
import DiceImage5 from "../images/Alea_a5.png";
import DiceImage6 from "../images/Alea_a6.png";

export default function Dice({ dice }) {
  const diceImages = [
    DiceImage1,
    DiceImage2,
    DiceImage3,
    DiceImage4,
    DiceImage5,
    DiceImage6,
  ];

  function show() {
    if (dice !== undefined) {
      return <img className="square" src={diceImages[dice - 1]} />;
    }
  }

  return <span className="container">{show()}</span>;
}

import "./index.css";
import { v4 as uuidv4 } from 'uuid';

function GridSquares() {

  const numOfSqrs = 50;
  const squares = new Array(numOfSqrs);

  for(let i = 0; i < numOfSqrs; i++) {
    let sqr = <span key={uuidv4()}></span>
    squares[i] = sqr;
  }

  return (
    <div className='squares-container'>
      {squares}
    </div>
  )
}

export default GridSquares

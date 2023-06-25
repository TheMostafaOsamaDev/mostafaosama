import React from 'react'

function HeaderSquares() {
  const squares = new Array(12);


  for(let i = 0;i < squares.length; i++) {
    squares[i] = <span className='square' key={"sub-header-square-"+i}></span>;
  }

  return (
    <div className='header-squares'>
      { squares }
    </div>
  )
}

export default HeaderSquares;

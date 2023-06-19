function getJWTFromCookie(cookieName) {
  const cookieValue = document.cookie.match(
    "(^|;)\\s*" + cookieName + "\\s*=\\s*([^;]+)"
  );
  if (cookieValue) {
    const jwt = decodeURIComponent(cookieValue.pop());
    return jwt;
  }
  return null;
}

const jwt = getJWTFromCookie("jwt");
socket.emit("jwt", jwt);

let chessboard = [
  ["R", "N", "B", "Q", "K", "B", "N", "R"], // Row 0 (back row for black pieces)
  ["P", "P", "P", "P", "P", "P", "P", "P"], // Row 1 (pawns for black pieces)
  [" ", " ", " ", " ", " ", " ", " ", " "], // Row 2 (empty row)
  [" ", " ", " ", " ", " ", " ", " ", " "], // Row 3 (empty row)
  [" ", " ", " ", " ", " ", " ", " ", " "], // Row 4 (empty row)
  [" ", " ", " ", " ", " ", " ", " ", " "], // Row 5 (empty row)
  ["p", "p", "p", "p", "p", "p", "p", "p"], // Row 6 (pawns for white pieces)
  ["r", "n", "b", "q", "k", "b", "n", "r"], // Row 7 (back row for white pieces)
];

let turn = false;
let WHITE = false;

function isWin() {
  const bordstr = JSON.stringify(chessboard);
  if (!bordstr.includes("K")) {
    return "B";
  }
  if (!bordstr.includes("k")) {
    return "W";
  }
}
function invertArray(array) {
  let inarr = [
    ["R", "N", "B", "Q", "K", "B", "N", "R"], // Row 0 (back row for black pieces)
    ["P", "P", "P", "P", "P", "P", "P", "P"], // Row 1 (pawns for black pieces)
    [" ", " ", " ", " ", " ", " ", " ", " "], // Row 2 (empty row)
    [" ", " ", " ", " ", " ", " ", " ", " "], // Row 3 (empty row)
    [" ", " ", " ", " ", " ", " ", " ", " "], // Row 4 (empty row)
    [" ", " ", " ", " ", " ", " ", " ", " "], // Row 5 (empty row)
    ["p", "p", "p", "p", "p", "p", "p", "p"], // Row 6 (pawns for white pieces)
    ["r", "n", "b", "q", "k", "b", "n", "r"], // Row 7
  ];

  for (i = 0; i < 8; i++) {
    for (j = 0; j < 8; j++) {
      inarr[i][j] = array[7 - i][7 - j];
    }
  }
  return inarr;
}

// socket.on("White", () => {
//   WHITE = true;
//   turn = true;
//   console.log("white");
//   chessboard = invertArray(chessboard);
//   printBoard(chessboard);
// });

socket.on("FullRoom", (message) => {
  const body = document.getElementById("parent");
  body.innerHTML = ` <div class="win">
        <h1>Room is Full</h1>
        <h1><a href="https://chess-online-c29k.onrender.com/">ruturn</a></h1>
      </div>`;
});

socket.on("White", () => {
  WHITE = true;
  turn = true;
  console.log("white");
  chessboard = invertArray(chessboard);
  printBoard(chessboard);
});

socket.on("Board", (data) => {
  turn = true;
  console.log("board");
  chessboard = invertArray(data);

  if (isWin() === "B") {
    const body = document.getElementById("parent");
    body.innerHTML = ` <div class="win">
        <h1>Black win🥳</h1>
         <form action="/home" method="get" class="formbutton">
  <button type="submit" >go back</button>
</form>
      </div>`;
  }
  if (isWin() === "W") {
    const body = document.getElementById("parent");
    body.innerHTML = `<div class="win">
        <h1>White win🥳</h1>
         <form action="/home" method="get" class="formbutton">
  <button type="submit" >go back</button>
</form>
      </div>`;
  }
  printBoard(chessboard);
});

let boardObj = {};
let board2Obj = {};

let p = 1;
for (i = 0; i < 8; i++) {
  for (j = 0; j < 8; j++) {
    // console.log(`block${p} = ${[i, j]}`)
    let str = String(i) + String(j);
    // console.log(str);
    boardObj[`#${str}`] = `block${p}`;
    board2Obj[`block${p}`] = [i, j];
    p++;
  }
}
printBoard(chessboard);

function swapPlaces(a, b, x, y) {
  console.log("Swaping");
  let str = String(a) + String(b);
  console.log(a, b, x, y);
  chessboard[x][y] = chessboard[a][b];
  chessboard[a][b] = " ";

  const doc = document.getElementById(boardObj[`#${str}`]);
  doc.style.removeProperty("background-image");

  // console.log(chessboard);
  Available = [];
  socket.emit("sendData", hash, chessboard);
  printBoard(chessboard);
  turn = false;

  if (isWin() === "B") {
    const body = document.getElementById("parent");
    body.innerHTML = ` <div class="win">
        <h1>Black win🥳</h1>
      </div>`;
  }
  if (isWin() === "W") {
    const body = document.getElementById("parent");
    body.innerHTML = `<div class="win">
        <h1>White win🥳</h1>
      </div>`;
  }
}
let Available = [];
function markAvailable() {
  Available.forEach((el) => {
    if (el[0] >= 0 && el[1] >= 0 && el[0] < 8 && el[1] < 8) {
      let str = "#" + String(el[0]) + String(el[1]);
      let block = document.getElementById(boardObj[str]);
      block.classList.add("NEWCLASS");
      block.style.backgroundColor = "yellow";
    }
  });
}

// Get the parent element
const parent = document.getElementById("board");
let isfirst = true;
let initial = [];

function removecolor() {
  const marked = document.querySelectorAll(".NEWCLASS");
  marked.forEach((el) => {
    el.style.removeProperty("background-color");
    el.classList.remove("NEWCLASS");
  });
}
if (turn);
{
  // Add a click event listener to the parent element
  parent.addEventListener("click", function (event) {
    // Check if the clicked element is a child of the parent
    if (!isfirst) {
      removecolor();
    }
    isfirst = false;

    if (event.target !== parent) {
      // Get the ID of the clicked child element
      // Available = [];
      let childId = event.target.id;
      const arr = board2Obj[childId];
      let availstr = JSON.stringify(Available);
      let arrstr = JSON.stringify(arr);
      if (!availstr.includes(arrstr)) {
        Available = [];
      }
      console.log(arr);
      // function whatisit(i, j) {
      //   if (i >= 0 && i < 8 && j >= 0 && j < 8) {
      //     if (chessboard[i][j] === chessboard[i][j].toUpperCase()) {
      //       return W;
      //     } else if (chessboard[i][j] === chessboard[i][j].toLowerCase()) {
      //       return b;
      //     } else if (chessboard[i][j] === " ") {
      //       return p;
      //     }
      //   }
      //   // return false;
      // }
      // if (WHITE && whatisit(arr[0], arr[1]) !== 'W' && initial[0] !== "") {
      // }

      if (turn) {
        WhichLogic(arr[0], arr[1]);
        availstr = JSON.stringify(Available);
        arrstr = JSON.stringify(arr);
        // console.log(`Avali str == ${availstr}`);
        // console.log(`initial == ${initial}`);
        // console.log(`includes == ${availstr.includes(arrstr)}`);

        if (initial[0] && availstr.includes(arrstr)) {
          console.log("available");
          swapPlaces(initial[0], initial[1], arr[0], arr[1]);
          removecolor();
          initial = [];
          Available = [];
          return;
        } else if (initial[0] === 0 && availstr.includes(arrstr)) {
          console.log("available");
          swapPlaces(initial[0], initial[1], arr[0], arr[1]);
          removecolor();
          initial = [];
          Available = [];
          return;
        }
      }
      // } else if (!WHITE && turn) {
      //   availstr = JSON.stringify(Available);
      //   arrstr = JSON.stringify(arr);
      //   console.log(`Avali str == ${availstr}`);
      //   console.log(`initial == ${initial}`);
      //   console.log(`includes == ${availstr.includes(arrstr)}`);

      //   if (initial[0] && availstr.includes(arrstr)) {
      //     console.log("available");
      //     swapPlaces(initial[0], initial[1], arr[0], arr[1]);
      //     removecolor();
      //     initial = [];
      //     Available = [];
      //     console.log("here");
      //     return;
      //   } else if (initial[0] === 0 && availstr.includes(arrstr)) {
      //     console.log("available");
      //     swapPlaces(initial[0], initial[1], arr[0], arr[1]);
      //     removecolor();
      //     initial = [];
      //     Available = [];
      //     return;
      //   }
      // }
      initial = [arr[0], arr[1]];
    }
  });
}



const socket = io(); // Connect various front ends to the backend socket.io setup

// socket.emit("Hare Krishna");

// socket.on("Hare Ram", () => {
//     console.log("Hare Rama Hare Krishna");
// }); // Example of sending data to server and then server sending it again to all the users present in the group (e.g., Telegram or WhatsApp)

const chess = new Chess();
const boardElement = document.querySelector(".chessboard");

let sourceSquare = null; // Initially, there is no source square because no one has moved
let draggedPiece = null; // Initially, there is no dragged piece because the game has not started yet
let playerRole = null; // Player role is null because players have not joined yet

const renderBoard = () => {
    // To render the chess board
    const board = chess.board();
    console.log(board);
    boardElement.innerHTML = "";

    board.forEach((row, rowIndex) => {
        row.forEach((square, squareIndex) => {
            const squareElement = document.createElement("div");
            squareElement.classList.add(
                'square',
                (rowIndex + squareIndex) % 2 === 0 ? "light" : "dark"
            );

            squareElement.dataset.row = rowIndex;
            squareElement.dataset.col = squareIndex;

            if (square) {
                const piece = document.createElement("div");
                piece.classList.add("piece", square.color === "w" ? "Light" : "Dark");

                piece.innerText = getPieceUnicode(square); // You may want to add the piece's Unicode character here
                piece.draggable = playerRole === square.color;

                piece.addEventListener("dragstart", (e) => {
                    if (piece.draggable) {
                        draggedPiece = piece;
                        sourceSquare = { row: rowIndex, col: squareIndex };
                        e.dataTransfer.setData("text/plain", "");
                    }
                });

                piece.addEventListener("dragend", () => {
                    draggedPiece = null;
                    sourceSquare = null;
                });

                squareElement.appendChild(piece);
            }


            squareElement.addEventListener("dragover", (e)=>{
                e.preventDefault();
            })

            squareElement.addEventListener('drop',(e)=>{
                e.preventDefault();

                if(draggedPiece){

                    const targetsource= {
                        row: parseInt(squareElement.dataset.row),
                        col:parseInt(squareElement.dataset.col),
                    };

                    handleMove(sourceSquare, targetsource);
                }

            })

            boardElement.appendChild(squareElement);
        });
    });
};

const handleMove = (source, target) => {
    // To handle moves
    const move={
        from: `${String.fromCharCode(97+ source.col) }${8-source.row}`,
        to: `${String.fromCharCode(97+ source.col) }${8-target.row}`
    }
    socket.emit('move', move);
};

const getPieceUnicode = (piece1) => {
    // To render faces of the rooks, knights, etc.
    
        const unicodeMap = {
            p: "♟", r: "♜", n: "♞", b: "♝", q: "♛", k: "♚",
            P: "♙", R: "♖", N: "♘", B: "♗", Q: "♕", K: "♔",
        };
        return unicodeMap[piece1.type] || "";

    
};

socket.on('playerRole', (role)=>{
playerRole=role;
renderBoard();
});

socket.on('spectatorRole', ()=>{
    playerRole=null;
    renderBoard();
});

socket.on('boardState',(fen)=>{
chess.load(fen);
renderBoard();
});

socket.on('move',(move)=>{
    chess.move(move);
    renderBoard();
});

renderBoard();
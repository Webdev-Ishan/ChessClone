const express= require('express')
const http= require('http')
const socket= require('socket.io')
const {Chess}= require('chess.js') // extracting only chess class from the chess.js
const path= require('path')
const { title } = require('process')

const app= express(); // create an express server which will handle routing and behave as a middleware
const server= http.createServer(app); // link that express server with an http server
const io= socket(server); // now that http server which is controlling the express server will be controlled by socket

// this whole setup is very imprtent for having socket.io functionalities in your project e.g. real time operations and updates.

const chess= new Chess();
// initialize the chess element for project

let players= {};
let currentplayer= 'W';

app.use(express.static(path.join(__dirname,'public')));


// main route 
app.get('/' , (req, res)=>{
    res.render('index.ejs', {title:"Chess Buster"})
})


// this si the code of backedn socket setup
io.on("connection",(uniquesocket)=>{
    console.log("connected")

    // connect feature

    // uniquesocket.on('Hare Krishna', ()=>{
    //     io.emit('Hare Ram')
    // })  this is reiceving the data from client side and giving respobnse based on it..

    // disconnect feature

    // uniquesocket.on('disconnect', ()=>{
    //     console.log('Disconnected')
    // })

    // this is the code for handling the chess game logic on server side
    if(!players.white){
        // if white field is not assigned to player then assign it with the unique socketid of player
        players.white= uniquesocket.id; // its unique because we do not want to assign same color to both
        uniquesocket.emit("playerrole","W") //emit the given ifo to all users
    }

    else if(!players.black){
        players.black=uniquesocket.id;
        uniquesocket.emit("playerrole","B") // same for black
    }
    else{
        uniquesocket.emit("Spectatorrole") // same for spectator
    }

// the logic of game if someone has left the game in betweeen
    uniquesocket.on('disconnect', ()=>{
// if wehite left
        if(uniquesocket.id===players.white){
            delete players.white;
        }
 // if black left       
        else if(uniquesocket.id===players.black){
            delete players.black;
        }
    // spectator does not affect the game
    })


  // logic for valid or invalid moves
  
  uniquesocket.on('move', (move)=>{
// try catch is very importetnt otherwise the server will crash and we do not want that to happen
    try {
// chess.js has provided these functionalities        
if(chess.turn('W') && uniquesocket.id!== players.white) return;
if(chess.turn('B') && uniquesocket.id!== players.black) return;
// it means if it is black turn and white is moving then its piece would came back to original place
    
const result= chess.move(move); // it holds the result valid or not, we will handle it further
// if move is right
if(result){
    currentplayer= chess.turn(); // change the turn of the player
    io.emit("move",move); // send the new move to all
    io.emit("boardstate",chess.fen()); // this will send the current boardstate to all
    // fen() is an inbuilt equation to tell the  state of all the pawns on chessboard
}
// else when result is wrong
else{
    // send the invalid move message to only the person who make the move, so use uniquesocket
    uniquesocket.emit("invalidmove: ", move);
}
} catch (error) {
// if there is any error then send the error message to the person who made the move
        io.emit("Something went wrong");
    }
  })
})

// same code is installedin frontend as well as form of cdn 
// when the browsert loads index.js it has a script attcahed to it chessgame.js which has the
// front end or client initialization of socket.io and it will automatically connect two player
// who will load same front end page along with backedn as well to handle real time operations

server.listen(3000, ()=> console.log("Working fine"))
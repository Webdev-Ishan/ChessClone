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

app.get('/' , (req, res)=>{
    res.render('index.ejs', {title:"Chess Buster"})
})



server.listen(3000, ()=> console.log("Working fine"))
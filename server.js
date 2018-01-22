//dependencies
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');

var app = express();
var server = http.Server(app);
var io = socketIO(server);

app.set('port', 5000);
app.use('/static', express.static(__dirname + '/static'));

//routing
app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, 'index.html'));
});

//server init
server.listen(5000, function() {
  console.log('Starting server on port 5000');
})

//add on websocket handlers
io.on('connection', function(socket) {
})

//handle players
var players = {}

io.on('connection', function(socket) {
  socket.on('new player', function() {
    players[socket.id] = {
      hasBuzzed: false,
      name: "default",
      score: 0
    };
  });
});


var qtext = "";
var qnumber = 0;

//read questions
function getNextWord(qnumber) {
  return "hello";
}

function readNextQuestion() {
  setInterval(function () {
    qtext = qtext + getNextWord();
    io.sockets.emit('qstate', qtext);
    console.log("emitted qstate");
  }, 500);
}

readNextQuestion();

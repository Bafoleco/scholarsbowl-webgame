console.log('entered');
//dependencies
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
var fs = require('fs')


//setup
var questions = fs.readFileSync('questions.txt','utf8');
var app = express();
var server = http.Server(app);
var io = socketIO(server);

app.set('port', 8080);
app.use('/static', express.static(__dirname + '/static'));

//routing
app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, 'index.html'));
});

//server init
server.listen(8080, function() {
  console.log('Starting server on port 5000');
})

//add on websocket handlers
io.on('connection', function(socket) {
})

//handle players
var players = {}

io.on('connection', function(socket) {
  socket.on('new player', function() {
    console.log(socket.id);
    players[socket.id] = {
      hasBuzzed: false,
      name: "default",
      score: 0
    };
  });
});

//game state
var qtext = "";
var question_number = 0;
var number_of_questions;
var paused = {}
var timer;
var char_index = 0;
var question;
var answer = [];
//read questions

function add_string(string) {
  answer.push(string);
}

function split_answer(answer_string) {
  console.log(answer_string);
  //break off front text
  var first_bracket_index = 0
  while(answer_string[first_bracket_index] != '[' && answer_string[first_bracket_index] != '(') {
    first_bracket_index++
  }
  console.log(answer_string.substring(0, first_bracket_index-1) + 'first part answer_string');
  add_string(answer_string.substring(0, first_bracket_index-1));
  answer_string = answer_string.substring(first_bracket_index + 2);
  console.log(answer_string);
  //cut off author
}

function setup_char_index() {
  char_index = 0;
  var q_index = 0;
  console.log(question_number);
  while (q_index < question_number) {
    char_index = 1;
    while(questions[char_index] != '&') {
      char_index++;
    }
    q_index++;
  }
  //state: char_index represents the index of the '&' before the correct question
}

function trim_leading_spaces(string) {
  var start_index = 0;
  if((string[start_index] != ' ') && (string[start_index] != ' ')) {
    return string;
  }
  else {
    while((string[start_index + 1] == ' ') || (string[start_index + 1] == ' ') ) {
      start_index++;
    }
    return string.substring(start_index + 1);
  }
}

function setup() {
  setup_char_index();
  console.log(char_index);
  var relative_end_question_index = 2;
  while(questions[relative_end_question_index + char_index] != '\"') {
    relative_end_question_index++;
  }
  question = trim_leading_spaces(questions.substring(char_index + 2, relative_end_question_index + char_index));

  var answer_index = relative_end_question_index + char_index;
  var relative_end_answer_index = 4;
  while(questions[relative_end_answer_index + answer_index] != '\"') {
    relative_end_answer_index++;
  }
  split_answer(trim_leading_spaces(questions.substring(answer_index + 4, relative_end_answer_index + answer_index)));

}

//unicode stuff watch out
function getNextWord() {
  var end_index = 0;
  while(question[end_index] != ' ' && question[end_index + 1] != undefined) {
    end_index++;
  }
  if(end_index + 1 == question.length) {
    clearInterval(timer);
    question_number++;
    if(question_number == number_of_questions) {
      question_number = 0;
    }
    setTimeout(readNextQuestion, 10000);
    return question;
  }
  var word = question.substring(0, end_index);
  question = trim_leading_spaces(question.substring(end_index));
  return word;
}

function readNextQuestion() {
  console.log('started');
  qtext = "";
  setup();
  timer = setInterval(function () {
    qtext = qtext + ' ' + getNextWord();
    io.sockets.emit('qstate', qtext);
  }, 200);
}

function isCorrect(anwser) {
  return anwser == qanwser;
}

//get anwsers
io.on('connection', function(socket) {
  socket.on('buzz', function(answer) {
    var player = players[socket.id];
    if(!player.hasBuzzed) {
      console.log('buzz');
      console.log(socket.id);
      if(isCorrect(answer)) {
        console.log('correct')
        clearInterval(timer);
      }
    }
  });
});

function count_questions() {
  number_of_questions = 0;
  for(var i = 0; i < questions.length; i++) {
    if(questions[i] == '&') {
      number_of_questions++;
    }
  }
}

function main() {
  count_questions();
  console.log(number_of_questions + 'num questions');
  readNextQuestion();

}

main();

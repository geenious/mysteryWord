const express = require('express');
const mustacheExpress = require('mustache-express');
const session = require('express-session');
const bodyParser = require('body-parser');
const fs = require('file-system');

const words = fs.readFileSync("/usr/share/dict/words", "utf-8").toLowerCase().split("\n");

const app = express();

// mustache HACK
let mustacheInstance = mustacheExpress();
mustacheInstance.cache = null;
app.engine('mustache', mustacheInstance);

// app.engine('mustache', mustacheExpress);
app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));

app.use(session({
  secret: 'hang man',
  saveUninitialized: true,
  resave: false
}));

function wordMysteryRender(req, res) {
  const word = words[Math.floor(Math.random() * words.length)];

  if (!req.session.word) {
    req.session.word = word;
  }

  const blankWord = req.session.word.replace(/\w/g,'_');

  let guesses = [];
  let attempts;

  res.render('index', {
    word: req.session.word,
    blankWord: blankWord,
    guesses: req.session.guesses,
    attempts: req.session.attempts
  });
}

app.get('/', function(req, res) {
  wordMysteryRender(req, res);
});

app.post('/', function(req, res) {
  if (!req.session.guesses) {
    req.session.guesses = [];
  }
  req.session.guesses.push(req.body.letter.toUpperCase());

  if (!req.session.attempts) {
    req.session.attempts = 8;
  }
  req.session.attempts -= 1;

  

  wordMysteryRender(req, res);
});


app.listen(3000, function() {
  console.log('Oh, hello there port 3000');
});

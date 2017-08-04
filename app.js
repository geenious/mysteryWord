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
  const blankWord = word.replace(/\w/g,'_');

  if (!req.session.word) {
    req.session.word = word;
  }

  if (!req.session.blankWord) {
    req.session.blankWord = blankWord;
  }

  let guesses = [];
  let attempts;

  res.render('index', {
    word: req.session.word,
    blankWord: req.session.blankWord,
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

  console.log(req.session);

  //  Make letters appear if guessed correctly
  req.session.blankWord = req.session.blankWord.split('');
  for (let i = 0; i < req.session.word.length; i++) {
    if (req.body.letter === req.session.word[i]) {
      req.session.blankWord[i] = req.body.letter;
    }
  }
  req.session.blankWord = req.session.blankWord.join('');

  wordMysteryRender(req, res);
});


app.listen(3000, function() {
  console.log('Oh, hello there port 3000');
});

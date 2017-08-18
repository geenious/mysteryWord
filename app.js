const express = require('express');
const mustacheExpress = require('mustache-express');
const session = require('express-session');
const bodyParser = require('body-parser');
const fs = require('file-system');
require('dotenv').config();

let words = fs.readFileSync(__dirname + '/wordsList.txt', 'utf-8').toLowerCase().split('\n');

const app = express();

const mustache = mustacheExpress();
if (process.env.NODE_ENV === 'development') {
  mustache.cache = null;
}
app.engine('mustache', mustache);
app.set('view engine', 'mustache');

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

app.get('/winner', (req, res) => {
  res.render('winner', { word: req.session.word });
  req.session.destroy()
});

app.get('/loser', (req, res) => {
  res.render('loser', { word: req.session.word });
  req.session.destroy();
});

app.post('/', function(req, res) {
  if (!req.session.guesses) {
    req.session.guesses = [];
  }
  req.session.guesses.push(req.body.letter.toUpperCase());

  if (!req.session.attempts) {
    req.session.attempts = 8;
  }

  if (req.session.word.indexOf(req.body.letter) < 0) {
    req.session.attempts -= 1;
  }

  //  Make letters appear if guessed correctly
  req.session.blankWord = req.session.blankWord.split('');
  for (let i = 0; i < req.session.word.length; i++) {
    if (req.body.letter === req.session.word[i]) {
      req.session.blankWord[i] = req.body.letter;
    }
  }
  req.session.blankWord = req.session.blankWord.join('');

  if (req.session.blankWord == req.session.word) {
    res.redirect('/winner');
    return;
  }

  if (req.session.attempts == 0) {
    res.redirect('/loser');
    return;
  }

  wordMysteryRender(req, res);
});


app.listen(process.env.PORT, function() {
  console.log(`Oh, hello there port ${process.env.PORT}`);
});

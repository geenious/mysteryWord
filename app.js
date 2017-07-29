const express = require('express');
const mustacheExpress = require('mustache-express');
const session = require('express-session');
const bodyParser = require('body-parser');
const fs = require('file-system');

const words = fs.readFileSync("/usr/share/dict/words", "utf-8").toLowerCase().split("\n");

const app = express();

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
  console.log(word);

  req.session.word = word;

  const blankWord = req.session.word.replace(/\w/g,'_');
  console.log(blankWord);

  let guesses = [];

  res.render('index', {
    // may need to use req.session.word as word value
    word: word,
    blankWord: blankWord,
    guesses: guesses
  });
}

app.get('/', function(req, res) {
  wordMysteryRender(req, res);
});

app.post('/', function(req, res) {
  // post guesses to page
  console.log(req.body.letter);
  wordMysteryRender(req, res);
});


app.listen(3000, function() {
  console.log('Oh, hello there port 3000');
});

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

function getRandomWord() {
  // console.log(words.length)
  let word = words[Math.floor(Math.random() * words.length)];
  // console.log(word);
}
// getRandomWord();

app.get('/', function(req, res) {

  const word = words[Math.floor(Math.random() * words.length)];
  console.log(word);
  req.session.word = word;

  const blankWord = word.replace(/\w/g,'_');
  console.log(blankWord);

  res.render('index', {
    word: word,
    blankWord: blankWord
  });
});


app.listen(3000, function() {
  console.log('Oh, hello there port 3000');
});

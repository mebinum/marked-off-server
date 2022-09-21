// server.js
// where your node app starts

// init project
// init project
var express = require('express');
var app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;


// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// Simple in-memory store for now
var dreams = [
  "Find and count some sheep",
  "Climb a really tall mountain",
  "Wash the dishes"
];

app.get("/", function (request, response) {
  response.json({"Hello": "world"});
});


app.post("/callback", function (request, response) {
  console.log("callback", request.body);
  //response.send(dreams);
  response.sendStatus(200);
});

// could also use the POST body instead of query string: http://expressjs.com/en/api.html#req.body
app.post("/dreams", function (request, response) {
  dreams.push(request.query.dream);
  response.sendStatus(200);
});


const server = app.listen(PORT, () => {
    console.log(`Express is listening to http://localhost:${PORT}`);
});

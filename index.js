// server.js
// where your node app starts

// init project
// init project
var express = require('express');
require("hellosign-embedded");
var app = express();

const dotenv = require("dotenv");

dotenv.config()

const PORT = process.env.PORT || 3000;

const helloSign = new HelloSign({
  clientId: process.env.HELLOSIGN_CLIENTID
});

const notion = new Client({ auth: process.env.NOTION_KEY })


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
  console.log("callback", request);
  
  //response.send(dreams);
  response.sendStatus(200);
});

app.get("/markoff/:pageId", (request, response) => {
  
  //get pageid
  //generate pdf
  //send pdf to hellosign api
  
  
client.open("https://app.hellosign.com/editor/embeddedSign?signature_id=044722cb46ae7151c31cd3559e948417&token=95f1102da3a3f4c4f5ee9521f56c2d32", {
  testMode: true
});
  
});

// could also use the POST body instead of query string: http://expressjs.com/en/api.html#req.body
app.post("/dreams", function (request, response) {
  dreams.push(request.query.dream);
  response.sendStatus(200);
});


const server = app.listen(PORT, () => {
    console.log(`Express is listening to http://localhost:${PORT}`);
});

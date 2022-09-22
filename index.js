// server.js
// where your node app starts


const express = require('express');
const { Client } = require("@notionhq/client");
const dotenv = require("dotenv");
const assets = require('./assets');
const { NotionPageToPdf } = require('./notionPageToPdf');

dotenv.config()

const hellosign = require('hellosign-sdk')({ key: process.env.HELLOSIGN_KEY });

// init project
var app = express();

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

app.use("/assets", assets);

const PORT = process.env.PORT || 3000;
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
  
  const opts = {
    test_mode: 1,
    clientId: process.env.HELLOSIGN_CLIENTID,
    type: 'request_signature',
    subject: 'The NDA we talked about',
    requester_email_address: 'alice@example.com',
    files: ['NDA.pdf']
};
  
});

// could also use the POST body instead of query string: http://expressjs.com/en/api.html#req.body
app.post("/dreams", function (request, response) {
  dreams.push(request.query.dream);
  response.sendStatus(200);
});


const server = app.listen(PORT, () => {
    console.log(`Express is listening to http://localhost:${PORT}`);
});

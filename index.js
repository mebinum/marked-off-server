// server.js
// where your node app starts

const express = require("express")
const { Client } = require("@notionhq/client")
const dotenv = require("dotenv")
const assets = require("./assets")
const { NotionPageToPdf } = require("./notionPageToPdf")
const { notionClient } = require("./notionClient");
const {
  logErrors,
  clientErrorHandler,
  errorHandler,
  allowCors
} = require("./middleware");

dotenv.config()

const hellosign = require("hellosign-sdk")({ key: process.env.HELLOSIGN_KEY })

// init project
var app = express()

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"))

app.use("/assets", assets)

const PORT = process.env.PORT || 3000
const notion = new Client({ auth: process.env.NOTION_KEY })

app.use(express.urlencoded({ extended: true }));
//allow cors
app.use(allowCors);
app.use(express.json());
app.use(logErrors);
app.use(clientErrorHandler);
app.use(errorHandler);

// we've started you off with Express,
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// Simple in-memory store for now
var dreams = [
  "Find and count some sheep",
  "Climb a really tall mountain",
  "Wash the dishes",
]

app.get("/", function (request, response) {
  // ;(async () => {
  //   const listUsersResponse = await notionClient.users.list({});
  //   console.log(listUsersResponse);
  // })()
  response.json({ Hello: "world" })
})

app.post("/hellosign-events", function (request, response) {
  console.log("callback data", request.body)
  //   var postData = JSON.parse(request.body);
  //console.log("postData data", postData);

  //response.send(dreams);
  response.set("content-Type", "text/plain")
  response.status(200).send("Hello API Event Received")
})

app.post("/markoff/:pageId", async (request, response, next) => {
  //get pageid
  const pageId = request.params.pageId
  const requestData = request.body;
  console.log("body", requestData);
  //generate pdf
  const pdfUrl = await NotionPageToPdf.toPdf(pageId).catch(next)
  //send pdf to hellosign api

  const signer1 = {
    email_address: "oyem@sheda.ltd",
    name: "Oyem",
    order: 0,
  }

  const signer2 = {
    email_address: "mike@sheda.ltd",
    name: "Mike",
    order: 1,
  }

  const signingOptions = {
    draw: true,
    type: true,
    upload: true,
    phone: false,
    default_type: "draw",
  }

  const fieldOptions = {
    date_format: "DD - MM - YYYY",
  }
  
  // signing_redirect_url: "URL of the notion page"
  
  const data = {
    title: "NDA with Acme Co.",
    subject: "The NDA we talked about",
    message:
      "Please sign this NDA and then we can discuss more. Let me know if you have any questions.",
    signers: [signer1, signer2],
    //ccEmailAddresses: ["lawyer@hellosign.com", "lawyer@example.com"],
    // signing_redirect_url: 'http://bondstreet.co.uk',
    // requesting_redirect_url: 'http://met.police.uk',
    file_url: [pdfUrl],
    // metadata: {
    //   custom_id: 1234,
    //   custom_text: "NDA #9",
    // },
    signing_options: signingOptions,
    fieldOptions: fieldOptions,
    test_mode: 0,
  }

  const result = await hellosign.signatureRequest.send(data);
  
  const responseMessage = {
    status: 200,
    message: `Successfully Marked Off Notion page ${pageId}`
  }
  
  console.log(result.body);
})

// could also use the POST body instead of query string: http://expressjs.com/en/api.html#req.body
app.post("/dreams", function (request, response) {
  dreams.push(request.query.dream)
  response.sendStatus(200)
})

const server = app.listen(PORT, () => {
  console.log(`Express is listening to http://localhost:${PORT}`)
})

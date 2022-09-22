// server.js
// where your node app starts

const express = require("express")
const { Client } = require("@notionhq/client")
const dotenv = require("dotenv")
const assets = require("./assets")
const { NotionPageToPdf } = require("./notionPageToPdf")

dotenv.config()

const hellosign = require("hellosign-sdk")({ key: process.env.HELLOSIGN_KEY })

// init project
var app = express()

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"))

app.use("/assets", assets)

const PORT = process.env.PORT || 3000
const notion = new Client({ auth: process.env.NOTION_KEY })

app.use(express.urlencoded({ extended: true }))
//app.use(express.json())

// we've started you off with Express,
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// Simple in-memory store for now
var dreams = [
  "Find and count some sheep",
  "Climb a really tall mountain",
  "Wash the dishes",
]

app.get("/", function (request, response) {
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

app.get("/markoff/:pageId", (request, response) => {
  //get pageid
  const pageId = request.params.pageId
  //generate pdf
  const pdfUrl = NotionPageToPdf.toPdf(pageId)
  //send pdf to hellosign api

  const signer1 = {
    emailAddress: "oyem@sheda.ltd",
    name: "Oyem",
    order: 0,
  }

  const signer2 = {
    emailAddress: "mike@sheda.ltd",
    name: "Mike",
    order: 1,
  }

  const signingOptions = {
    draw: true,
    type: true,
    upload: true,
    phone: false,
    defaultType: "draw",
  }

  const fieldOptions = {
    dateFormat: "DD - MM - YYYY",
  }

  const data = {
    title: "NDA with Acme Co.",
    subject: "The NDA we talked about",
    message:
      "Please sign this NDA and then we can discuss more. Let me know if you have any questions.",
    signers: [signer1, signer2],
    //ccEmailAddresses: ["lawyer@hellosign.com", "lawyer@example.com"],
    fileUrl: [pdfUrl.url],
    // metadata: {
    //   custom_id: 1234,
    //   custom_text: "NDA #9",
    // },
    signingOptions,
    fieldOptions,
    testMode: true,
  }

  const result = hellosign.signatureRequest.send(data);
  
  result
    .then(response => {
      console.log(response.body)
    })
    .catch(error => {
      console.log("Exception when calling HelloSign API:")
      console.log(error.body)
    })
})

// could also use the POST body instead of query string: http://expressjs.com/en/api.html#req.body
app.post("/dreams", function (request, response) {
  dreams.push(request.query.dream)
  response.sendStatus(200)
})

const server = app.listen(PORT, () => {
  console.log(`Express is listening to http://localhost:${PORT}`)
})

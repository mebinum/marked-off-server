// server.js
// where your node app starts

const express = require("express")
const { Client } = require("@notionhq/client")
const dotenv = require("dotenv")
const assets = require("./assets")
const { NotionPageToPdf } = require("./notionPageToPdf")
const { notionClient } = require("./notionClient")
const {
  logErrors,
  clientErrorHandler,
  errorHandler,
  allowCors,
} = require("./middleware")

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
//allow cors
app.use(allowCors)
app.use(express.json())

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

app.post("/markoff/:pageId", async (request, response, next) => {
  try {
    //get pageid
    const pageId = request.params.pageId
    const requestData = request.body
    console.log("body", requestData)
    //generate pdf
    const pdfUrl = await NotionPageToPdf.toPdf(pageId);
    //send pdf to hellosign api
    const notionPage = await notionClient.pages.retrieve({ page_id: pageId });
    const pageTitle = notionPage.properties.title.title[0].plain_text ;
    
    console.log("pageTitle", pageTitle);
    const {  
      requesterName,
      requesterEmail,
      signerName,
      signerEmail,
      requesterMessage
    } = requestData;
    
    const signer1 = {
      email_address: requesterEmail,
      name: requesterName,
      order: 0,
    }

    const signer2 = {
      email_address: signerEmail,
      name: signerName,
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
    const fullUrl = request.protocol + '://' + request.get('host') + pdfUrl;
    
    const opts = {
      title: `Requesting signature for ${pageTitle ? pageTitle : "contract"}`,
      subject: "Please Sign",
      message:requesterMessage,
      signers: [signer1, signer2],
      //ccEmailAddresses: ["lawyer@hellosign.com", "lawyer@example.com"],
      // signing_redirect_url: 'http://bondstreet.co.uk',
      // requesting_redirect_url: 'http://met.police.uk',
      file_url: [fullUrl],
      // metadata: {
      //   custom_id: 1234,
      //   custom_text: "NDA #9",
      // },
      signing_options: signingOptions,
      field_options: fieldOptions,
      test_mode: 0,
    }
    
    const signatureRequestData = await hellosign.signatureRequest.createEmbedded(opts);
   
    response.json({ signingPdfUrl: fullUrl, signatureRequest: signatureRequestData.signature_request });
//     const result = await hellosign.signatureRequest.send(data)

//     const responseMessage = {
//       status: 200,
//       message: `Successfully Marked Off Notion page ${pageId}`,
//     }

//     console.log(result.body)
  } catch (err) {
    next(err)
  }
})

// could also use the POST body instead of query string: http://expressjs.com/en/api.html#req.body
app.post("/dreams", function (request, response) {
  dreams.push(request.query.dream)
  response.sendStatus(200)
})

app.use(logErrors)
app.use(clientErrorHandler)
app.use(errorHandler)

const server = app.listen(PORT, () => {
  console.log(`Express is listening to http://localhost:${PORT}`)
})

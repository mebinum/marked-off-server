const { Client } = require("@notionhq/client");
const dotenv = require("dotenv");

dotenv.config()
const notionClient = new Client({ auth: process.env.NOTION_KEY });

module.exports =  {
  notionClient
};

const { Client } = require("@notionhq/client");
const dotenv = require("dotenv")
const _ = require("lodash")

dotenv.config()
const notion = new Client({ auth: process.env.NOTION_KEY });

export {notion};

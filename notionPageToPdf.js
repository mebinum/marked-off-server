const findAssetInfo = require("./findAssetInfo.js")
const { notionClient } = require("./notionClient")
const { uploadFileToDropbox } = require("./dropbox")
const Notion2Html = require("@jeufore/notion-2-html").default
const htmlToPdf = require("html-pdf-node")
const dotenv = require("dotenv")
dotenv.config()

class NotionPageToPdf {
  static async toPdf(pageId) {
    try {
      console.log("pageId", pageId)

      const notion = new Notion2Html(process.env.NOTION_KEY)

      const html = await notion.convert(pageId)

      const file = { content: html }
      const url = `/public/${pageId}.pdf`
      const fullPath = `${__dirname}${url}`
      const pdf = await htmlToPdf.generatePdf(file, { path: fullPath })
      //        //get notion page
      //        const response = await notionClient.pages.retrieve({ page_id: pageId });
      //        console.log("notion page", response);

      //        const pageBlocks = await notionClient.blocks.children.list({
      //           block_id: pageId,
      //        });

      //        console.log("notion page blocks", pageBlocks.results.length);

      // const assetInfo = findAssetInfo('contract.pdf');
      //console.log("assetInfo", assetInfo);
      return url
    } catch (err) {
      console.log(err)
      throw err
    }
  }
}

module.exports = {
  NotionPageToPdf,
}

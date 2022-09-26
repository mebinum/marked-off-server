const findAssetInfo = require('./findAssetInfo.js');
const { notionClient } = require("./notionClient");
const { Notion2Html } = require("@jeufore/notion-2-html");
const dotenv = require("dotenv");
dotenv.config();

class NotionPageToPdf {
  
  static async toPdf(pageId) {
     try {
       console.log("pageId",pageId);
       console.log("Notion2Html",Notion2Html);
       
       const notion = new Notion2Html(process.env.NOTION_KEY);
       
       const html =  await notion.convert(pageId);
       console.log("notion html", html);
       
       //get notion page
       const response = await notionClient.pages.retrieve({ page_id: pageId });
       console.log("notion page", response);
       
       const pageBlocks = await notionClient.blocks.children.list({
          block_id: pageId,
       });
       
       console.log("notion page blocks", pageBlocks.results.length);
       
      const assetInfo = findAssetInfo('contract.pdf');
      //console.log("assetInfo", assetInfo);
       return assetInfo.url;
    } catch (err) {
      console.log(err);
      throw err
    }
  }
}


module.exports = {
  NotionPageToPdf,
};
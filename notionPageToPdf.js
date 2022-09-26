const findAssetInfo = require('./findAssetInfo.js');

const { notionClient } = require("./notionClient");


class NotionPageToPdf {
  
  static async toPdf(pageId) {
     try {
       console.log("pageId",pageId)
       //get notion page
       const response = await notionClient.pages.retrieve({ page_id: pageId });
       console.log("notion page", response);
       
      const assetInfo = findAssetInfo('contract.pdf');
      console.log("assetInfo", assetInfo);
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
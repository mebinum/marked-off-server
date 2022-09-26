const findAssetInfo = require('./findAssetInfo.js');

const { notionClient } = require("./notionClient");


class NotionPageToPdf {
  
  static async toPdf(pageId) {
     try {
       console.log("pageId",pageId)
       //get notion page
       const pageProperty =  await sdk.retrieveAPageProperty({page_id: 'page_id', property_id: 'property_id', 'notion-version': '2022-06-28'});
       
      const assetInfo = findAssetInfo('contract.pdf');
      console.log("assetInfo", assetInfo);
       return assetInfo.url;
    } catch (err) {
      console.log(err);
    }
  }
}


module.exports = {
  NotionPageToPdf,
};
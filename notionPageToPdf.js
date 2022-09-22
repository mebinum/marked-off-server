const findAssetInfo = require('./findAssetInfo.js');

class NotionPageToPdf {
  
  static async toPdf(pageId) {
     try {
       console.log("pageId",pageId)
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
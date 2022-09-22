const fs = require('fs/promises');

class NotionPageToPdf {
  
  static async toPdf(pageId) {
     try {
       console.log("pageId",pageId)
      const data = await fs.readFile('./assets/contract.pdf', { encoding: 'utf8' });
      console.log(data);
       return data;
    } catch (err) {
      console.log(err);
    }
  }
}


module.exports = {
  NotionPageToPdf,
};
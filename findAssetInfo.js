// modified from https://glitch.com/edit/#!/assets-lib

const fs = require('fs');
const content = fs.readFileSync('.glitch-assets', 'utf8');
const rows = content.split("\n");
const assetsRaw = rows.map((row) => {
  try {
    return JSON.parse(row);
  } catch (e) {}
});
const assets = assetsRaw.filter((asset) => asset);

module.exports = function (path) {
  const  [matching] = assets.filter((asset) => {
    if(asset.name)
      return asset.name.replace(/ /g,'%20') === path;
  });
  if (matching === undefined) {
    throw new Error(`No asset found matching path: ${path}`);
  }
  return matching;
};

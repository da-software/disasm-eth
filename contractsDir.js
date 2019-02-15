const fs = require('fs');

function readJsonDir(path) {
  const fileNames = fs.readdirSync(path);
  const fileNamesWithPath = fileNames.map(x => `${path}/${x}`);

  return fileNamesWithPath;
}

function readJson(path) {
    const buffer = fs.readFileSync(path);
    const str = buffer.toString('utf8');
    const json = JSON.parse(str);

    return json;
}

function getSourceFileId(contractJson) {
    const src = contractJson.ast.src;
    const items = src.split(':');
    return parseInt(items[2]);
}

module.exports = {
    getSourceFileId,
    readJson,
    readJsonDir,
};
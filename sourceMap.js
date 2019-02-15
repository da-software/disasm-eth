const {scan} = require('./utils');

function getSourceMapPart(value, fallBack) {
    if (typeof (value) === 'undefined') {
        return fallBack;
    }
    if (typeof (value) === 'string') {
        if (value.length === 0) {
            return fallBack;
        } else {
            return value;
        }
    }
    throw new Error('Bad value');
}

function sourceMapReducer(acc, curr) {
    const parts = curr.split(':');
    const fullParts = [];
    for (let i = 0; i < 4; i++) {
        const fullPart = getSourceMapPart(parts[i], acc[i]);
        fullParts.push(fullPart);
    }
    const newAcc = [
        parseInt(fullParts[0]),
        parseInt(fullParts[1]),
        parseInt(fullParts[2]),
        fullParts[3],
        acc[4] + 1
    ];
    return newAcc;
}

function parseSourceMap(sourceMap) {
    const items = sourceMap.split(';');
    return scan(items, sourceMapReducer, [0, 0, 0, '-', -1]);
}

module.exports = {
    parseSourceMap,
};
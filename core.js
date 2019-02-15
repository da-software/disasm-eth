const contractsDir = require('./contractsDir');
const path = require('path');
const {zip, tuplesToMap, groupBy} = require('./utils');
const {getBlockTree, walkTree} = require('./blockTree');
const {parseSourceMap} = require('./sourceMap');
const {getLineOffsets, getLineNumByOffset} = require('./lineOffset');
const {hexStrToByteArray, parseBytesToInstructions, getInstructionOffsets, instructionToString} = require('./disasm');

function createBlock(start, end) {
    return {start, end};
}

function getBlockFromSourceMapPart(sourceMapPart) {
    return createBlock(sourceMapPart[0], sourceMapPart[0] + sourceMapPart[1]);
}

function sortedSetsToArrays(tree) {
    return {
        block: tree.block,
        children: tree.children.toArray().map(x => sortedSetsToArrays(x))
    }
}

function getKeyFromBlock(block) {
    return `start: ${block.start}; end: ${block.end}`;
}

function addSourcesToTree(tree, source) {
    walkTree(tree, node => {
        node.source = source.substring(node.block.start, node.block.end + 1);
    });
}

function addInstructionsToTree(tree, sourceMap, instructions, offsets) {
    const groupedInstructions = groupBy(sourceMap, x => {
        const block = getBlockFromSourceMapPart(x);
        return getKeyFromBlock(block);
    }, x => ({offset: offsets[x[4]], instruction: instructions[x[4]], instructionNumber: x[4]}));
    walkTree(tree, node => {
        node.instructions = groupedInstructions[getKeyFromBlock(node.block)];
    });

}

function makeFatTree(sourceMap, source, instructions, offsets) {
    const tree = sortedSetsToArrays(getBlockTree(sourceMap));
    addSourcesToTree(tree, source);
    addInstructionsToTree(tree, sourceMap, instructions, offsets);

    return tree;
}

function getJsonsByName(dirPath) {
    const contractPaths = contractsDir.readJsonDir(dirPath);
    const contractJsons = contractPaths.map(x => contractsDir.readJson(x));

    const contractNames = contractPaths.map(x => path.parse(x).name);

    const jsonsByName = tuplesToMap(zip(contractNames, contractJsons));

    return jsonsByName;
}

function getNamesBySourceId(jsonsByName) {
    const names = Object.keys(jsonsByName);
    const jsons = Object.values(jsonsByName);
    const sourceIds = jsons.map(x => contractsDir.getSourceFileId(x));
    const namesBySourceId = groupBy(zip(sourceIds, names), x => x[0], x => x[1]);

    return namesBySourceId;
}
function getFatTrees(contractName, jsonsByName) {
    if (!(contractName in jsonsByName)) {
        throw new Error('Unknown contract name');
    }

    const namesBySourceId = getNamesBySourceId(jsonsByName);

    const contract = jsonsByName[contractName];

    const sourceMap = contract.deployedSourceMap;
    const parsedSourceMap = parseSourceMap(sourceMap);

    const bytes = hexStrToByteArray(contract.deployedBytecode);
    const instructions = parseBytesToInstructions(bytes);
    const offsets = getInstructionOffsets(instructions);
    const instrutctionStrs = instructions.map(instructionToString);

    const usedSourceIds =
        Object.keys(groupBy(parsedSourceMap, x => x[2], () => undefined))
            .map(x => parseInt(x))
            .filter(x => x !== -1);

    const trees = usedSourceIds.map(
        x => makeFatTree(
            parsedSourceMap.filter(y => y[2] === x),
            jsonsByName[namesBySourceId[x][0]].source,
            instrutctionStrs,
            offsets
        )
    );

    return trees;
}

function getKeyFromSourceMapPart(sourceMapPart) {
    if (sourceMapPart[2] === -1) {
        return 'f:-1;s:0;e:0';
    } else {
        return `f:${sourceMapPart[2]};s:${sourceMapPart[0]};e:${sourceMapPart[0] + sourceMapPart[1]}`;
    }
}

function groupScanBlocks(parsedSourceMap) {
    const formatPart = x => ({block: getBlockFromSourceMapPart(x), sourceId: x[2]});
    const createItem = x => ({part: formatPart(x), indices: []});
    let currKey = getKeyFromSourceMapPart(parsedSourceMap[0]);
    const groups = [createItem(parsedSourceMap[0])];
    groups[0].indices.push(0);

    for (let i = 1; i < parsedSourceMap.length; i++) {
        const part = parsedSourceMap[i];
        const partKey = getKeyFromSourceMapPart(part);
        if (currKey === partKey) {
            const group = groups[groups.length - 1];
            group.indices.push(i);
        } else {
            const group = createItem(part);
            group.indices.push(i);
            groups.push(group);
            currKey = partKey;
        }
    }

    return groups;
}

function makeGroupsFat(groups, jsonsByName, namesBySourceId, instructions, offsets, lineOffsets) {
    const fatGroups = [];
    for (let i = 0; i < groups.length; i++) {
        const group = groups[i];

        let srcPart;
        let lineNumber;
        if (group.part.sourceId !== -1) {
            const src = jsonsByName[namesBySourceId[group.part.sourceId]].source;
            srcPart = src.substring(group.part.block.start, group.part.block.end);
            lineNumber = 1 + getLineNumByOffset(lineOffsets[namesBySourceId[group.part.sourceId]], group.part.block.start);
        }
        let strInstructions = [];
        for (let j = 0; j < group.indices.length; j++) {
            const index = group.indices[j];
            const instruction = {
                offset: offsets[index],
                instruction: instructionToString(instructions[index])
            };
            strInstructions.push(instruction);
        }
        const fatGroup = {
            lineNumber,
            srcPart,
            instructions: strInstructions,
        };
        fatGroups.push(fatGroup);
    }
    return fatGroups;
}

function getLineOffsetsBySourceName(jsonsByName) {
    const result = {};
    for (let name in jsonsByName) {
        const json = jsonsByName[name];
        const lineOffsets = getLineOffsets(json.source);
        result[name] = lineOffsets;
    }
    return result;
}

module.exports = {
    makeGroupsFat,
    groupScanBlocks,
    getLineOffsetsBySourceName,
    getJsonsByName,
    getNamesBySourceId,
    parseSourceMap,
    hexStrToByteArray,
    parseBytesToInstructions,
    getInstructionOffsets,
    getFatTrees,
};

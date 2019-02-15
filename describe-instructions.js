const {
    getLineOffsetsBySourceName,
    groupScanBlocks,
    makeGroupsFat,
    getJsonsByName,
    getNamesBySourceId,
    parseSourceMap,
    hexStrToByteArray,
    parseBytesToInstructions,
    getInstructionOffsets,
} = require('./core');

function describeInstructions() {
    const contractsRoot = './lab';
    const contractsOutDir = `${contractsRoot}/build/contracts`;

    const jsonsByName = getJsonsByName(contractsOutDir);
    const namesBySourceId = getNamesBySourceId(jsonsByName);

    const contractName = 'MyContractName';
    const contract = jsonsByName[contractName];
    const parsedSourceMap = parseSourceMap(contract.deployedSourceMap);

    const bytes = hexStrToByteArray(contract.deployedBytecode);
    const instructions = parseBytesToInstructions(bytes);
    const offsets = getInstructionOffsets(instructions);

    const lineOffsetsBySourceName = getLineOffsetsBySourceName(jsonsByName);
    const groups = groupScanBlocks(parsedSourceMap);
    const fatGroups = makeGroupsFat(groups, jsonsByName, namesBySourceId, instructions, offsets, lineOffsetsBySourceName);

    return fatGroups;
}

module.exports = {
    describeInstructions
};
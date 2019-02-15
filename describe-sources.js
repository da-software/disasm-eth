const {getFatTrees, getJsonsByName} = require('./core');

function describeSources() {
    const contractsRoot = './lab';
    const contractsOutDir = `${contractsRoot}/build/contracts`;

    const contractName = 'MyContractName';
    const jsonsByName = getJsonsByName(contractsOutDir);
    const fatTrees = getFatTrees(contractName, jsonsByName);

    return fatTrees;
}

module.exports = {
    describeSources
};
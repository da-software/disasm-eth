const SortedSet = require('collections/sorted-set');

function walkTree(node, nodeProcessor) {
    nodeProcessor(node);
    node.children.forEach(x => walkTree(x, nodeProcessor));
}

function createBlock(start, end) {
    return {start, end};
}

function createChildren() {
    return new SortedSet([], (x, y) => {
        const b1 = x.block;
        const b2 = y.block;
        return b1.start === b2.start && b1.end === b2.end;
    }, (x, y) => {
        const b1 = x.block;
        const b2 = y.block;
        return b1.start === b2.start ? b1.end - b2.end : b1.start - b2.start;
    });
}

function createNode(block) {
    return {block, children: createChildren()};
}

function getBlockFromSourceMapPart(sourceMapPart) {
    return createBlock(sourceMapPart[0], sourceMapPart[0] + sourceMapPart[1]);
}

const equalBlock = 'equalBlock';
const childBlock = 'childBlock';
const parentBlock = 'parentBlock';
const neighborhoodBlock = 'neighborhoodBlock';
const intersectingBlock = 'intersectingBlock';

function classifyBlock(referenceBlock, blockToClassify) {
    if (referenceBlock.start === blockToClassify.start && referenceBlock.end === blockToClassify.end) {
        return equalBlock;
    }
    if (blockToClassify.start < referenceBlock.start && referenceBlock.end < blockToClassify.end) {
        return parentBlock;
    }
    if (referenceBlock.start <= blockToClassify.start && blockToClassify.end <= referenceBlock.end) {
        return childBlock;
    }
    if (blockToClassify.end < referenceBlock.start || referenceBlock.end < blockToClassify.start) {
        return neighborhoodBlock;
    }
    if (blockToClassify.start < referenceBlock.start && blockToClassify.end >= referenceBlock.start && blockToClassify.end <= referenceBlock.end) {
        return intersectingBlock;
    }
    if (referenceBlock.start <= blockToClassify.start && blockToClassify.start <= referenceBlock.end && referenceBlock.end < blockToClassify.end) {
        return intersectingBlock;
    }
    throw new Error('unknown relation');
}

function filterChildren(block, nodesToTest, predicate) {
    const result = createChildren();

    nodesToTest.forEach(x => {
        const relation = classifyBlock(block, x.block);
        if (predicate(relation)) {
            result.push(x);
        }
    });

    return result
}

function addNode(root, block) {
    let currentNode = root;

    const relation = classifyBlock(currentNode.block, block);

    switch (relation) {
        case equalBlock:
            // do nothing
            break;
        case childBlock:
            const newInnerChildren = filterChildren(block, currentNode.children, x => x === childBlock);
            if (newInnerChildren.length > 0) {
                const newNode = createNode(block);
                newNode.children = newInnerChildren;

                const newCurrLevelChildren = filterChildren(block, currentNode.children, x => x !== childBlock);
                newCurrLevelChildren.push(newNode);
                currentNode.children = newCurrLevelChildren;
                break;
            }
            let isAdded = false;
            currentNode.children.some(childNode => {
                const childRelation = classifyBlock(childNode.block, block);
                switch (childRelation) {
                    case equalBlock:
                        // do nothing
                        isAdded = true;
                        return true;
                    case childBlock:
                        addNode(childNode, block);
                        isAdded = true;
                        return true;
                    case neighborhoodBlock:
                        return false;
                    default:
                        throw new Error('Unknown or unexpected relation');
                }
            });
            if (!isAdded) {
                currentNode.children.add(createNode(block));
            }
            break;
        case parentBlock:
            throw new Error('Block can not be parent');
        case neighborhoodBlock:
            throw new Error('Block can not be neighborhood');
        case intersectingBlock:
            throw new Error('Block can not be intersecting');
        default:
            throw new Error('Unknown relation');
    }
}

function getBlockTree(sourceMap) {
    const root = createNode(createBlock(-1e6, 1e6));

    for (let i = 0; i < sourceMap.length; i++) {
        const block = getBlockFromSourceMapPart(sourceMap[i]);
        addNode(root, block);
    }

    return root;
}

module.exports = {
    walkTree,
    getBlockTree,
};
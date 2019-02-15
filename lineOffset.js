function getLineOffsets(source) {
    const offsets = [];
    let startOffset = 0;

    for (let i = 0; i < source.length; i++) {
        const char = source[i];

        if (char === '\n') {
            offsets.push({start: startOffset, end: i});
            startOffset = i + 1;
        }
    }
    if (startOffset < source.length) {
        offsets.push({start: startOffset, end: i});
    }

    return offsets;
}

function getLineNumByOffset(lineOffsets, offset) {
    let l = 0;
    let r = lineOffsets.length - 1;
    while (l <= r) {
        let m = Math.floor((l + r) / 2);
        if (lineOffsets[m].end < offset) {
            l = m + 1;
        } else if (offset < lineOffsets[m].start) {
            r = m - 1;
        } else {
            return m;
        }
    }
    throw new Error('not found');
}

module.exports = {
    getLineOffsets,
    getLineNumByOffset,
}
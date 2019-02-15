const instructions = [
    // 0x00 Stop and Arithmetic Operations
    [0x00, 'STOP'],
    [0x01, 'ADD'],
    [0x02, 'MUL'],
    [0x03, 'SUB'],
    [0x04, 'DIV'],
    [0x05, 'SDIV'],
    [0x06, 'MOD'],
    [0x07, 'SMOD'],
    [0x08, 'ADDMOD'],
    [0x09, 'MULMOD'],
    [0x0a, 'EXP'],
    [0x0b, 'SIGNEXTEND'],

    // 0x10 Comparison & Bitwise Logic Operations
    [0x10, 'LT'],
    [0x11, 'GT'],
    [0x12, 'SLT'],
    [0x13, 'SGT'],
    [0x14, 'EQ'],
    [0x15, 'ISZERO'],
    [0x16, 'AND'],
    [0x17, 'OR'],
    [0x18, 'XOR'],
    [0x19, 'NOT'],
    [0x1a, 'BYTE'],

    // 0x20 SHA3
    [0x20, 'SHA3'],

    // 0x30 Environmental Information
    [0x30, 'ADDRESS'],
    [0x31, 'BALANCE'],
    [0x32, 'ORIGIN'],
    [0x33, 'CALLER'],
    [0x34, 'CALLVALUE'],
    [0x35, 'CALLDATALOAD'],
    [0x36, 'CALLDATASIZE'],
    [0x37, 'CALLDATACOPY'],
    [0x38, 'CODESIZE'],
    [0x39, 'CODECOPY'],
    [0x3a, 'GASPRICE'],
    [0x3b, 'EXTCODESIZE'],
    [0x3c, 'EXTCODECOPY'],
    [0x3d, 'RETURNDATASIZE'],
    [0x3e, 'RETURNDATACOPY'],

    // '0x40' Block Information
    [0x40, 'BLOCKHASH'],
    [0x41, 'COINBASE'],
    [0x42, 'TIMESTAMP'],
    [0x43, 'NUMBER'],
    [0x44, 'DIFFICULTY'],
    [0x45, 'GASLIMIT'],

    // 0x50 Stack, Memory, Storage and Flow Operations
    [0x50, 'POP'],
    [0x51, 'MLOAD'],
    [0x52, 'MSTORE'],
    [0x53, 'MSTORE8'],
    [0x54, 'SLOAD'],
    [0x55, 'SSTORE'],
    [0x56, 'JUMP'],
    [0x57, 'JUMPI'],
    [0x58, 'PC'],
    [0x59, 'MSIZE'],
    [0x5a, 'GAS'],
    [0x5b, 'JUMPDEST'],

    // 0x60 Push Operations
    [0x60, 'PUSH1'],
    [0x61, 'PUSH2'],
    [0x62, 'PUSH3'],
    [0x63, 'PUSH4'],
    [0x64, 'PUSH5'],
    [0x65, 'PUSH6'],
    [0x66, 'PUSH7'],
    [0x67, 'PUSH8'],
    [0x68, 'PUSH9'],
    [0x69, 'PUSH10'],
    [0x6a, 'PUSH11'],
    [0x6b, 'PUSH12'],
    [0x6c, 'PUSH13'],
    [0x6d, 'PUSH14'],
    [0x6e, 'PUSH15'],
    [0x6f, 'PUSH16'],
    [0x70, 'PUSH17'],
    [0x71, 'PUSH18'],
    [0x72, 'PUSH19'],
    [0x73, 'PUSH20'],
    [0x74, 'PUSH21'],
    [0x75, 'PUSH22'],
    [0x76, 'PUSH23'],
    [0x77, 'PUSH24'],
    [0x78, 'PUSH25'],
    [0x79, 'PUSH26'],
    [0x7a, 'PUSH27'],
    [0x7b, 'PUSH28'],
    [0x7c, 'PUSH29'],
    [0x7d, 'PUSH30'],
    [0x7e, 'PUSH31'],
    [0x7f, 'PUSH32'],

    // 0x80 Duplication Operations
    [0x80, 'DUP1'],
    [0x81, 'DUP2'],
    [0x82, 'DUP3'],
    [0x83, 'DUP4'],
    [0x84, 'DUP5'],
    [0x85, 'DUP6'],
    [0x86, 'DUP7'],
    [0x87, 'DUP8'],
    [0x88, 'DUP9'],
    [0x89, 'DUP10'],
    [0x8a, 'DUP11'],
    [0x8b, 'DUP12'],
    [0x8c, 'DUP13'],
    [0x8d, 'DUP14'],
    [0x8e, 'DUP15'],
    [0x8f, 'DUP16'],

    // 0x90 Exchange Operations
    [0x90, 'SWAP1'],
    [0x91, 'SWAP2'],
    [0x92, 'SWAP3'],
    [0x93, 'SWAP4'],
    [0x94, 'SWAP5'],
    [0x95, 'SWAP6'],
    [0x96, 'SWAP7'],
    [0x97, 'SWAP8'],
    [0x98, 'SWAP9'],
    [0x99, 'SWAP10'],
    [0x9a, 'SWAP11'],
    [0x9b, 'SWAP12'],
    [0x9c, 'SWAP13'],
    [0x9d, 'SWAP14'],
    [0x9e, 'SWAP15'],
    [0x9f, 'SWAP16'],

    // 0xa0 Logging Operations
    [0xa0, 'LOG0'],
    [0xa1, 'LOG1'],
    [0xa2, 'LOG2'],
    [0xa3, 'LOG3'],
    [0xa4, 'LOG4'],

    // 0xf0 System Operations
    [0xf0, 'CREATE'],
    [0xf1, 'CALL'],
    [0xf2, 'CALLCODE'],
    [0xf3, 'RETURN'],
    [0xf4, 'DELEGATECALL'],
    [0xfa, 'STATICCALL'],
    [0xfd, 'REVERT'],
    [0xfe, 'INVALID'],
    [0xff, 'SELFDESTRUCT'],
];

const instructionNamesByCode = instructions.reduce((acc, x) => {
    acc[x[0]] = x[1];
    return acc;
}, {});

const firstPushInstructionCode = 0x60;
const lastPushInstructionCode = 0x7f;

function hexStrToByteArray(str) {
    if (str[0] !== '0' || str[1] !== 'x') {
        throw new Error('0x not found at the beginning of the string');
    }
    if (str.length % 2 !== 0) {
        throw new Error('String must contain even number of characters');
    }

    const bytes = [];

    for (let i = 2; i < str.length; i += 2) {
        bytes.push(parseInt(str.substring(i, i + 2), 16));
    }

    return bytes;
}

function parseBytesToInstructions(bytes) {
    const instructions = [];

    let i = 0;
    while (i < bytes.length) {
        const byte = bytes[i];

        let instruction = [];
        if (firstPushInstructionCode <= byte && byte <= lastPushInstructionCode) {
            const pushDataLength = byte - firstPushInstructionCode + 1;
            const pushDataStart = i + 1;
            const pushData = bytes.slice(pushDataStart, pushDataStart + pushDataLength);

            instruction = [byte, ...pushData];
            i += pushDataLength + 1;
        } else {
            instruction = [byte];
            i++;
        }

        instructions.push(instruction);
    }

    return instructions;
}

function getInstructionOffsets(instructions) {
    let pc = 0;

    const offsets = [];

    for (let i = 0; i < instructions.length; i++) {
        offsets.push(pc);

        pc += instructions[i].length;
    }

    return offsets;
}

function instructionToString(instruction) {
    const code = instruction[0];
    const name = code in instructionNamesByCode ? instructionNamesByCode[code] : '<unknown>';

    let result;
    if (instruction.length > 1) {
        let data = instruction.slice(1).map(x => x.toString(16)).join('');
        if (data.length % 2 !== 0) {
            data = '0' + data;
        }
        result = `${name} 0x${data}`;
    } else {
        result = name;
    }

    return result;
}

module.exports = {
    hexStrToByteArray,
    parseBytesToInstructions,
    getInstructionOffsets,
    instructionToString,
};
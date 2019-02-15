function zip(xs, ys) {
    return xs.map((x, i) => [x, ys[i]]);
}

function tuplesToMap(xs) {
    return xs.reduce((acc, x) => {
        acc[x[0]] = x[1];
        return acc;
    }, {});
}

function groupBy(xs, getKey, getValue) {
    if (typeof  getValue === 'undefined') {
        getValue = x => x;
    }
    const result = xs.reduce((acc, x) => {
        const key = getKey(x);
        const bag = acc[key] || [];
        bag.push(getValue(x));
        acc[key] = bag;
        return acc;
    }, {});
    return result;
}

function scan(arr, reducer, initialValue) {
    let accumulator = initialValue;

    const result = [];

    for (const currValue of arr) {
        const curr = reducer(accumulator, currValue);
        accumulator = curr;
        result.push(curr);
    }
    return result;
}

module.exports = {
    zip,
    tuplesToMap,
    groupBy,
    scan,
};

function mapper(src, dest, keyList) {
    for (let key of keyList ? keyList : Object.getOwnPropertyNames(src))
        dest[key] = src[key];
}
function range(from, to, step) {
    if (to === void 0 && step === void 0) {
        to = from;
        from = 0;
    } else {
    }
    if (step === void 0) step = from < to ? 1 : -1;
    let list = [];
    if (step > 0) for (let idx = from; idx < to; idx += step) list.push(idx);
    else for (let idx = from; idx > to; idx += step) list.push(idx);
    return list;
}
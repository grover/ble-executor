
"use strict";

const BleBrowser = require('./BleBrowser');
const debug = require('debug');
const log = debug('ble-executor');

const browserSymbol = Symbol.for('de.michaelfroehlich.ble-executor.browser');
const nobleSymbol = Symbol.for('de.michaelfroehlich.ble-executor.noble');
// const executorSymbol = Symbol.for('de.michaelfroehlich.ble-executor.executor');

function getOrCreate(symbol, initializer) {
    if (global[symbol] === undefined) {
        log(`Creating ${Symbol.keyFor(symbol)} as global singleton...`);
        global[symbol] = initializer();
    }

    return global[symbol];
}

const noble = getOrCreate(nobleSymbol, () => {
    return require('noble');
});

const browser = getOrCreate(browserSymbol, () => {
    return new BleBrowser(debug('BleBrowser'), noble);    
});


module.exports = {
    browser: browser,
    executor: undefined,
    noble: noble
};

"use strict";

const BleExecutor = require('../src/index');
const browser = BleExecutor.browser;

browser.on('discovered', peripheral => {
    console.log(`Found device: name=${peripheral.advertisement.localName} address=${peripheral.address} rssi=${peripheral.rssi}`);
});

browser.start();

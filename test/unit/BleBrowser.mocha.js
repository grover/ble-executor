"use strict";

const EventEmitter = require('events').EventEmitter;
const BleBrowser = require('../../src/BleBrowser');

const assert = require('chai').assert;
const sinon = require('sinon');

describe('BleBrowser', () => {

    var noble;
    var clock;
    var browser;

    beforeEach(() => {
        noble = {
            startScanning: sinon.spy(),
            stopScanning: sinon.spy(),
            on: sinon.spy()
        };

        clock = sinon.useFakeTimers();
        
        browser = new BleBrowser(console.log, noble);
    });

    afterEach(() => {
        browser.stop();

        clock.restore();
    })

    it('Should not browse by default', () => {
        assert.isFalse(browser.isScanning());
        assert.isFalse(browser._shouldScan);
    });

    it('Should allow starting before noble has powered on', () => {
        browser.start();
        assert.isTrue(browser._shouldScan);
        assert.isFalse(browser.isScanning());
    });

    it('Should allow stopping before noble has powered on', () => {
        browser.start();
        browser.stop();
        assert.isFalse(browser._shouldScan);
        assert.isFalse(browser.isScanning());
    });

    it('Should put noble into discovery mode when scanning', () => {
        noble.state = 'poweredOn';
        browser.start();
        assert.isTrue(noble.startScanning.calledOnce);
    });

    it('Should not start scanning, while suspended.', () => {
        noble.state = 'poweredOn';
        browser.suspend();
        browser.start();
        assert.isFalse(noble.startScanning.calledOnce);
    });

    it('Should start scanning if noble becomes ready later', () => {
        browser.start();
        assert.isFalse(noble.startScanning.calledOnce);

        noble.state = 'poweredOn';
        clock.tick(1000);
        assert.isTrue(noble.startScanning.calledOnce);
    });



    it('Should stop scanning, when suspended', () => {
        noble.state = 'poweredOn';
        browser.start();

        browser.suspend();
        assert.isTrue(noble.stopScanning.calledOnce);
    });

    it('Should not stop scanning again, when suspended twice', () => {
        noble.state = 'poweredOn';
        browser.start();

        browser.suspend();
        browser.suspend();
        assert.isTrue(noble.stopScanning.calledOnce);
    });

    it('Should resume scanning, when suspensions have been removed', () => {
        noble.state = 'poweredOn';
        browser.start();

        browser.suspend();
        browser.resume();
        assert.isTrue(noble.startScanning.calledTwice);
    });

    it('Should not resume immediately, if suspensions are left.', () => {
        noble.state = 'poweredOn';
        browser.start();

        browser.suspend();
        browser.suspend();
        browser.resume();
        assert.isFalse(noble.startScanning.calledTwice);
    });
});
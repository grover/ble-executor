'use strict';

const EventEmitter = require('events').EventEmitter;

class BleBrowser extends EventEmitter {

  constructor(log, noble) {
    super();

    this.log = log;
    this.noble = noble;

    /** Indicates if the browser should be scanning */
    this._shouldScan = false;
    /** Indicates if scanning is currently enabled */
    this._isScanning = false;
    /** Counter of suspensions, only if suspensions are zero */
    this._suspensionCounter = 0;
    /** Timer for the next scan restart */
    this._restartTimer = undefined;

    this.noble.on('discover', this._onBleDeviceDiscovered.bind(this));
    this.noble.on('scanStart', this._onScanningStarted.bind(this));
    this.noble.on('scanStop', this._onScanningStopped.bind(this));
  }

  /**
   * Starts the discovery of BLE devices.
   */
  start() {
    if (this._shouldScan === false) {
      this._shouldScan = true;
      this._scan();
    }
  }

  /**
   * Stops the discovery of BLE devices.
   */
  stop() {
    if (this._shouldScan === true) {
      this._shouldScan = false;
      this._stop();
    }
  }

  /**
   * Suspends BLE device discovery.
   */
  suspend() {
    this._suspensionCounter++;    
    this.log(`Changed BLE discovery suspension counter: suspensionCounter=${this._suspensionCounter}`);
    if (this._suspensionCounter === 1) {
      this._stop();
    }
  }

  /**
   * 
   * Resumes scanning for BLE devices.
   * 
   * This function only resumes scanning for BLE devices once the suspension counter
   * reaches zero.
   * 
   */
  resume() {
    if (this._suspensionCounter > 0) {
      this._suspensionCounter--;
      this.log(`Changed BLE discovery suspension counter: suspensionCounter=${this._suspensionCounter}`);

      if (this._suspensionCounter === 0) {
        this._scan();
        
        // TODO: setTimeout(() => this._scan(), 1000);
      }
    }
  }

  /**
   * Determines if the browser is currently scanning for devices.
   */
  isScanning() {
      return this._isScanning;
  }

  /**
   * Starts scanning as soon as all conditions are met.
   * 
   * Conditions that affect the scanning mode:
   * 
   * - BLE stack initialized
   * - Scanning was started previously
   * - Scan suspension counter is zero
   * - Scanning hasn't already been initiated.
   * 
   */
  _scan() {
    if (this._shouldScan === false) {
      // Scanning was not requested
      return;
    }

    if (this._isScanning === true) {
      // Already scanning, do not restart scanning.
      return;
    }

    if (this._suspensionCounter > 0) {
      // Scanning was suspended, do not initiate it.
      return;
    }


    if (this.noble.state === 'poweredOn') {
      // BLE stack is initialized, try to initiate scanning
      this.log('Starting to scan for BLE devices');
      this.noble.startScanning([], true);
    }

    // Set a timeout to try to restart scanning, will disable itself with 
    // the above exit conditions
    const ScanStartTimeout = 1000;
    setTimeout(this._scan.bind(this), ScanStartTimeout);
  }

  _stop() {
    /**
     * Always stop scanning no matter of the other state conditions.
     */
    this.log('Stopping BLE device discovery');
    this.noble.stopScanning();
  }

  _onBleDeviceDiscovered(peripheral) {
    this.emit('discovered', peripheral);
  }

  _onScanningStarted() {
    this.log('Started scanning for BLE devices');
    this._isScanning = true;
  }

  _onScanningStopped() {
    /**
     * 
     * RPi Zero W stops scanning once a connection has been established. We make sure that
     * we keep scanning here to receive disconnected events in the future. Additionally
     * we can't aggressively restart scanning as that interferes with the establishment of
     * some accessory connections. Communication with a device is of higher importance, as such
     * further device discovery is delayed until communication has been stopped.
     * 
     */

    this.log('Stopped scanning for BLE devices');
    this._isScanning = false;
  }
}

module.exports = BleBrowser;

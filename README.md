# ble-executor

A shared BLE device discovery and command execution framework. Enables sequential access to multiple BLE devices on a Raspberry Pi and other Bluetooth chipsets with a low number of concurrent connections.

This library is implemented as a global singleton, meaning that it can be shared across many modules (or homebridge plugins) without interfering with each other.

This library is still in development.

## BleBrowser

Runs bluetooth LE discovery whenever the bluetooth chipset is disconnected, useful to receive status indications from Bluetooth LE devices that indicate their status via manufacturer specific data in their announcements. (E.g. HomeKit BLE devices or Parrot Flower Power/Pot devices.)

## BleExecutor

Maintains an execution queue to ensure that the bluetooth chipset is not overloaded by too many concurrent connections and scanning procedures.

Not yet available.

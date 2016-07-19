//
// Tenx Driver for Tenx USB Rocket Launcher
// Sold in the UK as Marks and Spencer USB Missile Launcher
// (C) Roger Hardiman 2016
//


/*
  The Tenx USB Rocket Launcher has the following Device description
  Device {
    busNumber: 1,
    deviceAddress: 9,
    deviceDescriptor:
     { bLength: 18,
       bDescriptorType: 1,
       bcdUSB: 272,
       bDeviceClass: 0,
       bDeviceSubClass: 0,
       bDeviceProtocol: 0,
       bMaxPacketSize0: 8,
       idVendor: 4400,       <- 0x1130
       idProduct: 514,       <- 0x0202
       bcdDevice: 256,
       iManufacturer: 0,
       iProduct: 2,
       iSerialNumber: 0,
       bNumConfigurations: 1 },
    portNumbers: [ 3 ] },
*/


var usb = require('usb')
var CMD = {
            UP: 0x02,
            DOWN: 0x01,
            LEFT: 0x04,
            RIGHT: 0x08,
            FIRE: 0x10,
            STOP: 0x20
        };


function TenxDriver() {
}

TenxDriver.prototype.open = function() {
  // Find and Open
  this.launcher = usb.findByIds(0x1130,0x202);
  this.launcher.open();

  // Detach Kernel Driver
  if (this.launcher.interfaces[0].isKernelDriverActive()) {
    this.launcher.interfaces[0].detachKernelDriver();
  }

  if (this.launcher.interfaces[1].isKernelDriverActive()) {
    this.launcher.interfaces[1].detachKernelDriver();
  }
}

TenxDriver.prototype.close = function() {
  if (!this.launcher.interfaces[0].isKernelDriverActive()) {
    this.launcher.interfaces[0].attachKernelDriver();
  }
  if (!this.launcher.interfaces[1].isKernelDriverActive()) {
    this.launcher.interfaces[1].attachKernelDriver();
  }
}

TenxDriver.prototype.send_command = function(command) {
  // command has 2 header messages followed by a payload
  // use nested callbacks to deliver each in turn
  header_1 = new Buffer([85, 83, 66, 67,  0,  0, 4, 0]);
  header_2 = new Buffer([85, 83, 66, 67,  0, 64, 2, 0]);
  left_msg = new Buffer([0, 1, 0, 0, 0, 0, 8, 8,
                         0, 0, 0, 0, 0, 0, 0, 0,
                         0, 0, 0, 0, 0, 0, 0, 0,
                         0, 0, 0, 0, 0, 0, 0, 0,
                         0, 0, 0, 0, 0, 0, 0, 0,
                         0, 0, 0, 0, 0, 0, 0, 0,
                         0, 0, 0, 0, 0, 0, 0, 0,
                         0, 0, 0, 0, 0, 0, 0, 0]);
  right_msg = new Buffer([0, 0, 1, 0, 0, 0, 8, 8,
                         0, 0, 0, 0, 0, 0, 0, 0,
                         0, 0, 0, 0, 0, 0, 0, 0,
                         0, 0, 0, 0, 0, 0, 0, 0,
                         0, 0, 0, 0, 0, 0, 0, 0,
                         0, 0, 0, 0, 0, 0, 0, 0,
                         0, 0, 0, 0, 0, 0, 0, 0,
                         0, 0, 0, 0, 0, 0, 0, 0]);
  up_msg = new Buffer([0, 0, 0, 1, 0, 0, 8, 8,
                         0, 0, 0, 0, 0, 0, 0, 0,
                         0, 0, 0, 0, 0, 0, 0, 0,
                         0, 0, 0, 0, 0, 0, 0, 0,
                         0, 0, 0, 0, 0, 0, 0, 0,
                         0, 0, 0, 0, 0, 0, 0, 0,
                         0, 0, 0, 0, 0, 0, 0, 0,
                         0, 0, 0, 0, 0, 0, 0, 0]);
  down_msg = new Buffer([0, 0, 0, 0, 1, 0, 8, 8,
                         0, 0, 0, 0, 0, 0, 0, 0,
                         0, 0, 0, 0, 0, 0, 0, 0,
                         0, 0, 0, 0, 0, 0, 0, 0,
                         0, 0, 0, 0, 0, 0, 0, 0,
                         0, 0, 0, 0, 0, 0, 0, 0,
                         0, 0, 0, 0, 0, 0, 0, 0,
                         0, 0, 0, 0, 0, 0, 0, 0]);
  fire_msg = new Buffer([0, 0, 0, 0, 0, 1, 8, 8,
                         0, 0, 0, 0, 0, 0, 0, 0,
                         0, 0, 0, 0, 0, 0, 0, 0,
                         0, 0, 0, 0, 0, 0, 0, 0,
                         0, 0, 0, 0, 0, 0, 0, 0,
                         0, 0, 0, 0, 0, 0, 0, 0,
                         0, 0, 0, 0, 0, 0, 0, 0,
                         0, 0, 0, 0, 0, 0, 0, 0]);
  stop_msg = new Buffer([0, 0, 0, 0, 0, 0, 8, 8,
                         0, 0, 0, 0, 0, 0, 0, 0,
                         0, 0, 0, 0, 0, 0, 0, 0,
                         0, 0, 0, 0, 0, 0, 0, 0,
                         0, 0, 0, 0, 0, 0, 0, 0,
                         0, 0, 0, 0, 0, 0, 0, 0,
                         0, 0, 0, 0, 0, 0, 0, 0,
                         0, 0, 0, 0, 0, 0, 0, 0]);

  this.launcher.controlTransfer(0x21,0x09,0x02,0x01,header_1);
  this.launcher.controlTransfer(0x21,0x09,0x02,0x01,header_2);
  if (command == CMD.LEFT) this.launcher.controlTransfer(0x21,0x09,0x02,0x00, left_msg);
  if (command == CMD.RIGHT) this.launcher.controlTransfer(0x21,0x09,0x02,0x00, right_msg);
  if (command == CMD.UP) this.launcher.controlTransfer(0x21,0x09,0x02,0x00, up_msg);
  if (command == CMD.DOWN) this.launcher.controlTransfer(0x21,0x09,0x02,0x00, down_msg);
  if (command == CMD.STOP) this.launcher.controlTransfer(0x21,0x09,0x02,0x00, stop_msg);
  if (command == CMD.FIRE) this.launcher.controlTransfer(0x21,0x09,0x02,0x00, fire_msg);
}

TenxDriver.prototype.up = function() { this.send_command(CMD.UP)};
TenxDriver.prototype.down = function() { this.send_command(CMD.DOWN)};
TenxDriver.prototype.left = function() { this.send_command(CMD.LEFT)};
TenxDriver.prototype.right = function() { this.send_command(CMD.RIGHT)};
TenxDriver.prototype.stop = function() { this.send_command(CMD.STOP)};
TenxDriver.prototype.fire = function() { this.send_command(CMD.FIRE)};

module.exports = TenxDriver;

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const SerialPort = require("serialport");
const debug = require('debug')('salesfusion:icboxlib');
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function ticksOf(date) {
    return (date.getTime() * 10000) + 621355968000000000;
}
class IcBox {
    constructor() {
    }
    isConnected() {
        return this.serialport !== undefined && this.serialport.isOpen;
    }
    getPorts() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                SerialPort.list((err, ports) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(ports);
                });
            });
        });
    }
    recieve(timeout = 500) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.serialport || !this.serialport.isOpen) {
                throw new Error("port_not_open");
            }
            const initialTicks = Math.round(ticksOf(new Date()));
            debug(`initial ticks: ${initialTicks}`);
            let timeoutReached = false;
            let text = "";
            try {
                if (this.serialport) {
                    while (!timeoutReached) {
                        text += yield this.serialport.read(1024);
                        debug(`recieved: ${text}`);
                        if (text.indexOf("\r") > -1) {
                            debug("exit receive while");
                            break;
                        }
                        yield wait(50);
                        timeoutReached = (ticksOf(new Date()) - initialTicks) >= timeout;
                    }
                    debug(`ticks end: ${ticksOf(new Date())}`);
                    debug(`received serial: ${text}`);
                }
            }
            catch (err) {
                if (!text)
                    text = "";
                debug(`error: ${err.message}`);
            }
            return text || "";
        });
    }
    open(port) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                try {
                    this.serialport = new SerialPort(port, {
                        autoOpen: false,
                        baudRate: 57600,
                        parity: 'none',
                        stopBits: 1,
                        dataBits: 8
                    });
                    this.serialport.on('error', (err) => {
                        console.log(err.message);
                        process.exit(1);
                    });
                    this.serialport.on('data', (data) => {
                        /* get a buffer of data from the serial port */
                        debug('data: ' + data.toString());
                    });
                    this.serialport.open(err => {
                        if (err) {
                            return reject(err);
                        }
                        return resolve();
                    });
                }
                catch (err) {
                    reject(err);
                }
            });
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.serialport.isOpen) {
                return new Promise((resolve, reject) => {
                    this.serialport.close(err => {
                        if (err) {
                            return reject(err);
                        }
                        return resolve(true);
                    });
                });
            }
            return Promise.resolve(false);
        });
    }
    sendCommand(command) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.serialport) {
                return new Promise((resolve, reject) => {
                    try {
                        const commandText = command.toString() + "\r\n";
                        this.serialport.write(commandText, (err, written) => {
                            if (err) {
                                return reject(err);
                            }
                            return resolve(written);
                        });
                    }
                    catch (err) {
                        reject(err);
                    }
                });
            }
            return Promise.resolve(-1);
        });
    }
    getVersionInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            let result = "";
            if (this.serialport.isOpen && (yield this.sendCommand("@CV"))) {
                result = yield this.recieve(500);
            }
            return result;
        });
    }
    getOnHook() {
        return __awaiter(this, void 0, void 0, function* () {
            let text = "0";
            if (this.serialport.isOpen && (yield this.sendCommand("@CG?"))) {
                text = yield this.recieve(500);
                debug(`getOnHook response: ${text}`);
            }
            return text.indexOf("0") > -1;
        });
    }
    checkConnectionStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            let text = "";
            if (this.serialport.isOpen && (yield this.sendCommand("@CX"))) {
                text = yield this.recieve(500);
                debug(`connection status response: ${text}`);
            }
            return text.indexOf("F") > -1;
        });
    }
    dialNumber(number) {
        return __awaiter(this, void 0, void 0, function* () {
            let text = "";
            if (this.serialport.isOpen && (yield this.sendCommand("@CI" + number))) {
                text = yield this.recieve(500);
                debug(`dialNumber response: ${text}`);
            }
            return text.indexOf("F") > -1;
        });
    }
    getEvent(timeout = 500) {
        return __awaiter(this, void 0, void 0, function* () {
            let text = "";
            if (this.serialport.isOpen) {
                text = yield this.recieve(timeout);
                debug(`getEvent response: ${text}`);
            }
            return text;
        });
    }
    getRXLevel() {
        return __awaiter(this, void 0, void 0, function* () {
            let text = "";
            if (this.serialport.isOpen && (yield this.sendCommand("@CN?"))) {
                text = yield this.recieve(500);
                debug(`getRXLevel response: ${text}`);
            }
            const result = parseFloat(text);
            return !isNaN(result) ? Math.round(result) : 0;
        });
    }
    setRXLevel(rxLevel) {
        return __awaiter(this, void 0, void 0, function* () {
            let text = "";
            if (this.serialport.isOpen && (yield this.sendCommand("@CN" + rxLevel.toString()))) {
                text = yield this.recieve(500);
                debug(`setRXLevel response: ${rxLevel} -> ${text}`);
            }
            return text.indexOf("F") > -1;
        });
    }
    getRXMode() {
        return __awaiter(this, void 0, void 0, function* () {
            let text = "";
            if (this.serialport.isOpen && (yield this.sendCommand("@CM?"))) {
                text = yield this.recieve(500);
                debug(`getRXMode response: ${text}`);
            }
            const result = parseFloat(text);
            return !isNaN(result) ? Math.round(result) : 0;
        });
    }
    setRXMode(rxMode) {
        return __awaiter(this, void 0, void 0, function* () {
            let text = "";
            if (this.serialport.isOpen && (yield this.sendCommand("@CM" + rxMode.toString()))) {
                text = yield this.recieve(500);
                debug(`setRXMode response: ${rxMode} -> ${text}`);
            }
            return text.indexOf("F") > -1;
        });
    }
    getId() {
        return __awaiter(this, void 0, void 0, function* () {
            let text = "";
            if (this.serialport.isOpen && (yield this.sendCommand("@CS?"))) {
                text = yield this.recieve(500);
                debug(`getId response: ${text}`);
            }
            const result = parseFloat(text);
            return !isNaN(result) ? Math.round(result) : 0;
        });
    }
    setId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let text = "";
            if (this.serialport.isOpen && (yield this.sendCommand("@CS" + id))) {
                text = yield this.recieve(500);
                debug(`setId response: ${id} -> ${text}`);
            }
            return text.indexOf("F") > -1;
        });
    }
}
exports.IcBox = IcBox;
process.on('unhandledRejection', r => debug(r));
const serial = new IcBox();
serial.open("COM1").then((done) => __awaiter(this, void 0, void 0, function* () {
    debug('connected');
    try {
        const status = yield serial.getEvent();
        console.log(status);
    }
    catch (err) {
        console.error(err);
    }
})).catch(err => {
    console.error(err);
});

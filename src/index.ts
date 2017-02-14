import * as SerialPort from 'serialport';

const debug = require('debug')('salesfusion:icboxlib');

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function ticksOf(date: Date) {
    return (date.getTime() * 10000) + 621355968000000000;
}

export class IcBox {

    private serialport: SerialPort;

    constructor() {
    }

    isConnected() {
        return this.serialport !== undefined && this.serialport.isOpen;
    }

    public async getPorts() {
        return new Promise((resolve, reject) => {
            SerialPort.list((err, ports) => {
                if (err) { return reject(err); }
                return resolve(ports as Array<any>);
            });
        });
    }

    public async recieve(timeout: number = 500) {

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
                    text += await this.serialport.read();

                    if (text.indexOf("\r") > -1) {
                        debug("exit receive while");
                        break;
                    }

                    await wait(50);
                    timeoutReached = (ticksOf(new Date()) - initialTicks) >= timeout;
                }

                debug(`ticks end: ${ticksOf(new Date())}`);
                debug(`received serial: ${text}`);
            }
        } catch (err) {
            if (!text) text = "";
            debug(`error: ${err.message}`)
        }

        return text || "";
    }

    public async open(port?: string) {
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
                    if (err) { return reject(err); }
                    return resolve();
                });

            } catch (err) {
                reject(err);
            }
        });
    }

    public async close() {
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
    }

    public async sendCommand(command: string) {
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
                } catch (err) {
                    reject(err);
                }
            });
        }
        return Promise.resolve(-1);
    }

    public async getVersionInfo() {
        let result = "";
        if (this.serialport.isOpen && await this.sendCommand("@CV")) {
            result = await this.recieve(500);
        }
        return result;
    }

    public async getOnHook() {
        let text = "0";
        if (this.serialport.isOpen && await this.sendCommand("@CG?")) {
            text = await this.recieve(500);
            debug(`getOnHook response: ${text}`)
        }
        return text.indexOf("0") > -1;
    }

    public async checkConnectionStatus() {
        let text = "";
        if (this.serialport.isOpen && await this.sendCommand("@CX")) {
            text = await this.recieve(500);
            debug(`connection status response: ${text}`)
        }
        return text.indexOf("F") > -1;
    }

    public async dialNumber(number: number) {
        let text = "";
        if (this.serialport.isOpen && await this.sendCommand("@CI" + number)) {
            text = await this.recieve(500);
            debug(`dialNumber response: ${text}`)
        }
        return text.indexOf("F") > -1;
    }

    public async getEvent(timeout: number = 500) {
        let text = "";
        if (this.serialport.isOpen) {
            text = await this.recieve(timeout);
            debug(`getEvent response: ${text}`)
        }
        return text;
    }

    public async getRXLevel() {

        let text = "";

        if (this.serialport.isOpen && await this.sendCommand("@CN?")) {
            text = await this.recieve(500);
            debug(`getRXLevel response: ${text}`)
        }

        const result = parseFloat(text);
        return !isNaN(result) ? Math.round(result) : 0;
    }

    public async setRXLevel(rxLevel: number) {

        let text = "";

        if (this.serialport.isOpen && await this.sendCommand("@CN" + rxLevel.toString())) {
            text = await this.recieve(500);
            debug(`setRXLevel response: ${rxLevel} -> ${text}`);
        }

        return text.indexOf("F") > -1;
    }

    public async getRXMode() {

        let text = "";

        if (this.serialport.isOpen && await this.sendCommand("@CM?")) {
            text = await this.recieve(500);
            debug(`getRXMode response: ${text}`)
        }

        const result = parseFloat(text);
        return !isNaN(result) ? Math.round(result) : 0;
    }

    public async setRXMode(rxMode: number) {

        let text = "";

        if (this.serialport.isOpen && await this.sendCommand("@CM" + rxMode.toString())) {
            text = await this.recieve(500);
            debug(`setRXMode response: ${rxMode} -> ${text}`);
        }

        return text.indexOf("F") > -1;
    }

    public async getId() {

        let text = "";

        if (this.serialport.isOpen && await this.sendCommand("@CS?")) {
            text = await this.recieve(500);
            debug(`getId response: ${text}`)
        }

        const result = parseFloat(text);
        return !isNaN(result) ? Math.round(result) : 0;
    }

    public async setId(id: string) {

        let text = "";

        if (this.serialport.isOpen && await this.sendCommand("@CS" + id)) {
            text = await this.recieve(500);
            debug(`setId response: ${id} -> ${text}`);
        }

        return text.indexOf("F") > -1;
    }
}

// process.on('unhandledRejection', r => debug(r));

// const serial = new IcBox();

// serial.open("COM1").then(async done => {
//     debug('connected');

//     try {

//         const status = await serial.getEvent(500);
//         console.log(status);

//     } catch (err) {
//         console.error(err);
//     }

// }).catch(err => {
//     console.error(err);
// });
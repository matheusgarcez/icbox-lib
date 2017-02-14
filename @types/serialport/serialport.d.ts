declare module 'serialport' {

    class SerialPort {
        constructor(path: string, options?: SerialPort.Options, openImmediately?: boolean, callback?: (err: any) => void)
        isOpen: boolean;
        on(event: string, callback?: (data?: any) => void): void;
        open(callback?: (err: any) => void): void;
        write(buffer: any, callback?: (err: any, bytesWritten: number) => void): void
        read(size?: number): string | Buffer | null;
        pause(): void;
        resume(): void;
        disconnected(err: Error): void;
        close(callback?: (err: any) => void): void;
        flush(callback?: (err: any) => void): void;
        set(options: SerialPort.SetOptions, callback: (err: any) => void): void;
        drain(callback?: (err: any) => void): void;
        update(options: SerialPort.UpdateOptions, callback?: (err: any) => void): void;
        static list(callback: (err: any, ports: SerialPort.PortConfig[]) => void): void;
        static parsers: {
            readline: (delimiter: string) => void,
            raw: (emitter: any, buffer: string) => void
        };
    }

    namespace SerialPort {
        interface PortConfig {
            comName: string;
            manufacturer: string;
            serialNumber: string;
            pnpId: string;
            locationId: string;
            vendorId: string;
            productId: string;
        }

        interface SetOptions {
            brk?: boolean;
            cts?: boolean;
            dsr?: boolean;
            dtr?: boolean;
            rts?: boolean;
        }

        interface UpdateOptions {
            baudRate?: number;
        }

        interface Options {
            /**
             * Automatically opens the port on nextTick
             * 
             * @type {boolean}
             * @default true
             */
            autoOpen?: boolean;

            /**
             * Prevent other processes from opening the port
             * OBS: false is not currently supported on windows
             * 
             * @default true
             * @type {boolean}
             */
            lock?: boolean;

            /**
             * Baud Rate. 
             * Should be one of: 115200, 57600, 38400, 19200, 9600, 4800, 2400, 1800, 1200, 600, 300, 200, 150, 134, 110, 75, or 50. 
             * Custom rates as allowed by hardware is supported.
             * OBS: Windows doesn't support custom baud rates.
             * 
             * @default 9600
             * @type {number}
             */
            baudRate?: number;

            /**
             * Data Bits.
             * Must be one of: 8, 7, 6, or 5.
             * 
             * @default 8
             * @type {number}
             */
            dataBits?: number;

            /**
             * Stop Bits.
             * Must be one of: 1 or 2
             * 
             * @default 1
             * @type {number}
             */
            stopBits?: number;

            /**
             * Parity.
             * Must be one of:  'none', 'even', 'mark', 'odd', 'space'
             * 
             * @default none
             * @type {string}
             */
            parity?: string;

            /**
             * flow control
             * 
             * @type {boolean}
             * @default false
             */
            rtscts?: boolean;

            /**
             * flow control
             * 
             * @default false
             * @type {boolean}
             */
            xon?: boolean;

            /**
             * flow control
             * 
             * @default false
             * @type {boolean}
             */
            xoff?: boolean;

            /**
             * flow control
             * 
             * @default false
             * @type {boolean}
             */
            xany?: boolean;

            /**
             * Size of read buffer.
             * 
             * @type {number}
             * @default 65536
             */
            bufferSize?: number;

            /**
             * The parser engine to use with read data, 
             * defaults to rawPacket strategy which just 
             * emits the raw buffer as a "data" event. 
             * 
             * Can be any function that accepts EventEmitter 
             * as first parameter and the raw buffer as the second parameter.
             * 
             * @type {Function}
             * @default {rawPacket}
             */
            parser?: Function;

            /**
             * Sets platform specific options
             * 
             * @type {*}
             */
            platformOptions?: any;
        }
    }

    export = SerialPort;
}
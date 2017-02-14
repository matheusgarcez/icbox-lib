export declare class IcBox {
    private serialport;
    constructor();
    isConnected(): boolean;
    getPorts(): Promise<{}>;
    recieve(timeout?: number): Promise<string>;
    open(port?: string): Promise<{}>;
    close(): Promise<{}>;
    sendCommand(command: string): Promise<{}>;
    getVersionInfo(): Promise<string>;
    getOnHook(): Promise<boolean>;
    checkConnectionStatus(): Promise<boolean>;
    dialNumber(number: number): Promise<boolean>;
    getEvent(timeout?: number): Promise<string>;
    getRXLevel(): Promise<number>;
    setRXLevel(rxLevel: number): Promise<boolean>;
    getRXMode(): Promise<number>;
    setRXMode(rxMode: number): Promise<boolean>;
    getId(): Promise<number>;
    setId(id: string): Promise<boolean>;
}

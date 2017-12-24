import { Logger } from 'log4js';
export declare class Tracer {
    private isEnabled;
    private logger;
    private source;
    private remote;
    private id;
    private seq;
    private msg;
    constructor(logger: Logger, enabledRpcLog: boolean, source: string, remote: string, msg: string, id?: string, seq?: number);
    getLogger(role: string, module: string, method: string, des: string): {
        traceId: string;
        seq: number;
        role: string;
        source: string;
        remote: string;
        module: string;
        method: string;
        args: string;
        timestamp: number;
        description: string;
    };
    info(role: string, module: string, method: string, des: string): void;
    debug(role: string, module: string, method: string, des: string): void;
    error(role: string, module: string, method: string, des: string): void;
}

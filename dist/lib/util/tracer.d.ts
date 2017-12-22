export declare class Tracer {
    private isEnabled;
    private logger;
    private source;
    private remote;
    private id;
    private seq;
    private msg;
    constructor(logger: any, enabledRpcLog: any, source: any, remote: any, msg: any, id?: string, seq?: number);
    getLogger(role: any, module: any, method: any, des: any): {
        traceId: string;
        seq: number;
        role: any;
        source: string;
        remote: string;
        module: string;
        method: any;
        args: string;
        timestamp: number;
        description: any;
    };
    info(role: any, module: any, method: any, des: any): void;
    debug(role: any, module: any, method: any, des: any): void;
    error(role: any, module: any, method: any, des: any): void;
}

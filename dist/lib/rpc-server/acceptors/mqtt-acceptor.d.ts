/// <reference types="node" />
import { EventEmitter } from 'events';
import * as net from 'net';
export declare class MQTTAcceptor extends EventEmitter {
    interval: number;
    bufferMsg: any;
    rpcLogger: any;
    rpcDebugLog: any;
    _interval: any;
    sockets: any;
    msgQueues: any;
    cb: (tracer: any, msg?: any, cb?: Function) => void;
    inited: boolean;
    server: net.Server;
    closed: boolean;
    constructor(opts: any, cb: (tracer: any, msg?: any, cb?: Function) => void);
    listen(port: any): void;
    close(): void;
    onSocketClose(socket: any): void;
    cloneError(origin: any): {
        msg: any;
        stack: any;
    };
    processMsg(socket: any, pkg: any): void;
    processMsgs(socket: any, pkgs: any): void;
    enqueue(socket: any, msg: any): void;
    flush(): void;
    doSend(socket: any, msg: any): void;
}
/**
 * create acceptor
 *
 * @param opts init params
 * @param cb(tracer, msg, cb) callback function that would be invoked when new message arrives
 */
export declare function create(opts: any, cb: any): MQTTAcceptor;

/// <reference types="node" />
import { EventEmitter } from 'events';
import * as net from 'net';
export declare class Acceptor extends EventEmitter {
    interval: number;
    bufferMsg: any;
    rpcLogger: any;
    rpcDebugLog: any;
    _interval: any;
    sockets: any;
    msgQueues: any;
    cb: Function;
    inited: boolean;
    server: net.Server;
    closed: boolean;
    constructor(opts: any, cb: any);
    listen(port: any): void;
    close(): void;
    onSocketClose(socket: any): void;
}
/**
 * create acceptor
 *
 * @param opts init params
 * @param cb(tracer, msg, cb) callback function that would be invoked when new message arrives
 */
export declare function create(opts: any, cb: any): Acceptor;

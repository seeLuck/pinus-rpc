/// <reference types="node" />
import { EventEmitter } from 'events';
export declare class MailBox extends EventEmitter {
    constructor(server: any, opts: any);
    curId: number;
    id: string;
    host: string;
    port: number;
    requests: {};
    timeout: {};
    queue: any[];
    bufferMsg: any;
    keepalive: number;
    interval: number;
    timeoutValue: any;
    keepaliveTimer: any;
    lastPing: number;
    lastPong: number;
    connected: boolean;
    closed: boolean;
    opts: any;
    serverId: string;
    socket: any;
    _interval: NodeJS.Timer;
    connect(tracer: any, cb: any): any;
    /**
    * close mailbox
    */
    close(): void;
    /**
    * send message to remote server
    *
    * @param msg {service:"", method:"", args:[]}
    * @param opts {} attach info to send method
    * @param cb declaration decided by remote interface
    */
    send(tracer: any, msg: any, opts: any, cb: any): void;
    setupKeepAlive(): void;
    checkKeepAlive(): void;
}
/**
* Factory method to create mailbox
*
* @param {Object} server remote server info {id:"", host:"", port:""}
* @param {Object} opts construct parameters
*                      opts.bufferMsg {Boolean} msg should be buffered or send immediately.
*                      opts.interval {Boolean} msg queue flush interval if bufferMsg is true. default is 50 ms
*/
export declare function create(server: any, opts: any): MailBox;

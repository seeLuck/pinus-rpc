/// <reference types="node" />
import { EventEmitter } from 'events';
export declare class Gateway extends EventEmitter {
    opts: any;
    port: number;
    started: boolean;
    stoped: boolean;
    acceptorFactory: any;
    services: any;
    acceptor: any;
    constructor(opts: any);
    stop(): void;
    start(): void;
}
/**
 * create and init gateway
 *
 * @param opts {services: {rpcServices}, connector:conFactory(optional), router:routeFunction(optional)}
 */
export declare function create(opts: any): Gateway;

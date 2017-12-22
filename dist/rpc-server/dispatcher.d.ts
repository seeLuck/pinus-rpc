/// <reference types="node" />
import { EventEmitter } from 'events';
export declare class Dispatcher extends EventEmitter {
    services: {
        [key: string]: {
            [key: string]: {
                [key: string]: Function;
            };
        };
    };
    constructor(services: any);
    /**
     * route the msg to appropriate service object
     *
     * @param msg msg package {service:serviceString, method:methodString, args:[]}
     * @param services services object collection, such as {service1: serviceObj1, service2: serviceObj2}
     * @param cb(...) callback function that should be invoked as soon as the rpc finished
     */
    route(tracer: any, msg: any, cb: any): void;
}

export declare function encodeClient(id: any, msg: any, servicesMap: any): any;
export declare function encodeServer(id: any, args: any): any;
export declare function decodeServer(buf: any, servicesMap: any): {
    id: any;
    msg: {
        namespace: any;
        service: any;
        method: any;
        args: any;
    };
};
export declare function decodeClient(buf: any): {
    id: any;
    resp: any;
};

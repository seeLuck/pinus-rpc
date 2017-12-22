/// <reference types="node" />
export declare class InputBuffer {
    buf: Buffer;
    pos: number;
    count: number;
    constructor(buffer: any);
    read: () => any;
    readBoolean: () => boolean;
    readByte: () => any;
    readBytes: () => any;
    readChar: () => any;
    readDouble: () => any;
    readFloat: () => any;
    readInt: () => any;
    readShort: () => any;
    readUInt: () => any;
    readUShort: () => any;
    readString: () => any;
    readObject: () => any;
    check: (len: any) => void;
}

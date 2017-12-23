/// <reference types="node" />
export declare class InputBuffer {
    buf: Buffer;
    pos: number;
    count: number;
    constructor(buffer: any);
    read(): number;
    readBoolean(): boolean;
    readByte(): number;
    readBytes(): Buffer;
    readChar(): number;
    readDouble(): number;
    readFloat(): number;
    readInt(): number;
    readShort(): number;
    readUInt(): number;
    readUShort(): number;
    readString(): string;
    readObject(): any;
    check(len: any): void;
}

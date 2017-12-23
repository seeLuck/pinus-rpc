/// <reference types="node" />
export declare class OutputBuffer {
    count: number;
    size: number;
    offset: number;
    buf: Buffer;
    constructor(size: any);
    getData(): Buffer;
    getLength(): number;
    write(data: any, offset: any, len: any): void;
    writeBoolean(v: any): void;
    writeByte(v: any): void;
    writeBytes(bytes: any): void;
    writeChar(v: any): void;
    writeChars(bytes: any): void;
    writeDouble(v: any): void;
    writeFloat(v: any): void;
    writeInt(v: any): void;
    writeShort(v: any): void;
    writeUInt(v: any): void;
    writeUShort(v: any): void;
    writeString(str: any): void;
    writeObject(object: any): void;
    ensureCapacity(len: any): void;
    grow(minCapacity: any): void;
    getBuffer(): Buffer;
}

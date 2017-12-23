"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pomelo_logger_1 = require("pomelo-logger");
var logger = pomelo_logger_1.getLogger('pomelo-rpc', 'OutputBuffer');
const Utils = require("../utils");
var BUFFER_SIZE_DEFAULT = 32;
class OutputBuffer {
    constructor(size) {
        this.count = 0;
        this.offset = 0;
        this.size = size || BUFFER_SIZE_DEFAULT;
        this.buf = new Buffer(this.size);
    }
    getData() {
        return this.buf;
    }
    getLength() {
        return this.count;
    }
    write(data, offset, len) {
        this.ensureCapacity(len);
        this.buf.write(data, offset, len);
        this.count += len;
    }
    writeBoolean(v) {
        this.writeByte(v ? 1 : 0);
    }
    writeByte(v) {
        this.ensureCapacity(1);
        this.buf.writeUInt8(v, this.count++);
    }
    writeBytes(bytes) {
        var len = bytes.length;
        this.ensureCapacity(len + 4);
        this.writeInt(len);
        for (var i = 0; i < len; i++) {
            this.buf.writeUInt8(bytes[i], this.count++);
        }
    }
    writeChar(v) {
        this.writeByte(v);
    }
    writeChars(bytes) {
        this.writeBytes(bytes);
    }
    writeDouble(v) {
        this.ensureCapacity(8);
        this.buf.writeDoubleLE(v, this.count);
        this.count += 8;
    }
    writeFloat(v) {
        this.ensureCapacity(4);
        this.buf.writeFloatLE(v, this.count);
        this.count += 4;
    }
    writeInt(v) {
        this.ensureCapacity(4);
        this.buf.writeInt32LE(v, this.count);
        this.count += 4;
    }
    writeShort(v) {
        this.ensureCapacity(2);
        this.buf.writeInt16LE(v, this.count);
        this.count += 2;
    }
    writeUInt(v) {
        this.ensureCapacity(4);
        this.buf.writeUInt32LE(v, this.count);
        this.count += 4;
    }
    writeUShort(v) {
        this.ensureCapacity(2);
        this.buf.writeUInt16LE(v, this.count);
        this.count += 2;
    }
    writeString(str) {
        var len = Buffer.byteLength(str);
        this.ensureCapacity(len + 4);
        this.writeInt(len);
        this.buf.write(str, this.count, len);
        this.count += len;
    }
    writeObject(object) {
        var type = Utils.getType(object);
        // console.log('writeObject type %s', type);
        // console.log(object)
        if (!type) {
            logger.error('invalid writeObject ' + object);
            return;
        }
        this.writeShort(type);
        var typeMap = Utils.typeMap;
        if (typeMap['null'] == type) {
            return;
        }
        if (typeMap['buffer'] == type) {
            this.writeBytes(object);
            return;
        }
        if (typeMap['array'] == type) {
            var len = object.length;
            this.writeInt(len);
            for (var i = 0; i < len; i++) {
                this.writeObject(object[i]);
            }
            return;
        }
        if (typeMap['string'] == type) {
            this.writeString(object);
            return;
        }
        if (typeMap['object'] == type) {
            this.writeString(JSON.stringify(object));
            // logger.error('invalid writeObject object must be bearcat beans and should implement writeFields and readFields interfaces');
            return;
        }
        if (typeMap['bean'] == type) {
            this.writeString(object['$id']);
            object.writeFields(this);
            return;
        }
        if (typeMap['boolean'] == type) {
            this.writeBoolean(object);
            return;
        }
        if (typeMap['float'] == type) {
            this.writeFloat(object);
            return;
        }
        if (typeMap['number'] == type) {
            this.writeInt(object);
            return;
        }
    }
    ensureCapacity(len) {
        var minCapacity = this.count + len;
        if (minCapacity > this.buf.length) {
            this.grow(minCapacity); // double grow
        }
    }
    grow(minCapacity) {
        var oldCapacity = this.buf.length;
        var newCapacity = oldCapacity << 1;
        if (newCapacity - minCapacity < 0) {
            newCapacity = minCapacity;
        }
        if (newCapacity < 0 && minCapacity < 0) {
            throw new Error('OutOfMemoryError');
            // newCapacity = 0x7fffffff; // Integer.MAX_VALUE
        }
        // console.log('grow minCapacity %d newCapacity %d', minCapacity, newCapacity);
        var newBuf = new Buffer(newCapacity);
        this.buf.copy(newBuf);
        this.buf = newBuf;
    }
    getBuffer() {
        return this.buf.slice(0, this.offset);
    }
}
exports.OutputBuffer = OutputBuffer;
//# sourceMappingURL=outputBuffer.js.map
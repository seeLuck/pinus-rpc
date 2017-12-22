"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pomelo_logger_1 = require("pomelo-logger");
var logger = pomelo_logger_1.getLogger('pomelo-rpc', 'OutputBuffer');
const Utils = require("../utils");
var BUFFER_SIZE_DEFAULT = 32;
class OutputBuffer {
    constructor(size) {
        this.count = 0;
        this.getLength = function () {
            return this.count;
        };
        this.write = function (data, offset, len) {
            this.ensureCapacity(len);
            this.buf.write(data, offset, len);
            this.count += len;
        };
        this.writeBoolean = function (v) {
            this.writeByte(v ? 1 : 0);
        };
        this.writeByte = function (v) {
            this.ensureCapacity(1);
            this.buf.writeUInt8(v, this.count++);
        };
        this.writeBytes = function (bytes) {
            var len = bytes.length;
            this.ensureCapacity(len + 4);
            this.writeInt(len);
            for (var i = 0; i < len; i++) {
                this.buf.writeUInt8(bytes[i], this.count++);
            }
        };
        this.writeChar = function (v) {
            this.writeByte(v);
        };
        this.writeChars = function (bytes) {
            this.writeBytes(bytes);
        };
        this.writeDouble = function (v) {
            this.ensureCapacity(8);
            this.buf.writeDoubleLE(v, this.count);
            this.count += 8;
        };
        this.writeFloat = function (v) {
            this.ensureCapacity(4);
            this.buf.writeFloatLE(v, this.count);
            this.count += 4;
        };
        this.writeInt = function (v) {
            this.ensureCapacity(4);
            this.buf.writeInt32LE(v, this.count);
            this.count += 4;
        };
        this.writeShort = function (v) {
            this.ensureCapacity(2);
            this.buf.writeInt16LE(v, this.count);
            this.count += 2;
        };
        this.writeUInt = function (v) {
            this.ensureCapacity(4);
            this.buf.writeUInt32LE(v, this.count);
            this.count += 4;
        };
        this.writeUShort = function (v) {
            this.ensureCapacity(2);
            this.buf.writeUInt16LE(v, this.count);
            this.count += 2;
        };
        this.writeString = function (str) {
            var len = Buffer.byteLength(str);
            this.ensureCapacity(len + 4);
            this.writeInt(len);
            this.buf.write(str, this.count, len);
            this.count += len;
        };
        this.writeObject = function (object) {
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
        };
        this.ensureCapacity = function (len) {
            var minCapacity = this.count + len;
            if (minCapacity > this.buf.length) {
                this.grow(minCapacity); // double grow
            }
        };
        this.grow = function (minCapacity) {
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
        };
        this.getBuffer = function () {
            return this.buf.slice(0, this.offset);
        };
        this.size = size || BUFFER_SIZE_DEFAULT;
        this.buf = new Buffer(this.size);
    }
    getData() {
        return this.buf;
    }
}
exports.OutputBuffer = OutputBuffer;
//# sourceMappingURL=outputBuffer.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto");
var getKeysLength = function (map) {
    return Object.keys(map).length;
};
var hash = function (algorithm, str) {
    return crypto.createHash(algorithm).update(str).digest('hex');
};
var compare = function (v1, v2) {
    return v1 > v2 ? 1 : v1 < v2 ? -1 : 0;
};
class ConsistentHash {
    constructor(nodes, opts) {
        this.ring = {};
        this.keys = [];
        this.nodes = [];
        this.opts = opts || {};
        this.replicas = this.opts.replicas || 100;
        this.algorithm = this.opts.algorithm || 'md5';
        this.station = this.opts.station;
        for (var i = 0; i < nodes.length; i++) {
            this.addNode(nodes[i]);
        }
        this.station.on('addServer', this.addNode.bind(this));
        this.station.on('removeServer', this.removeNode.bind(this));
    }
    ;
    addNode(node) {
        this.nodes.push(node);
        for (var i = 0; i < this.replicas; i++) {
            var key = hash(this.algorithm, (node.id || node) + ':' + i);
            this.keys.push(key);
            this.ring[key] = node;
        }
        this.keys.sort();
    }
    ;
    removeNode(node) {
        for (var i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i] === node) {
                this.nodes.splice(i, 1);
                i--;
            }
        }
        for (var j = 0; j < this.replicas; j++) {
            var key = hash(this.algorithm, (node.id || node) + ':' + j);
            delete this.ring[key];
            for (var k = 0; k < this.keys.length; k++) {
                if (this.keys[k] === key) {
                    this.keys.splice(k, 1);
                    k--;
                }
            }
        }
    }
    ;
    getNode(key) {
        if (getKeysLength(this.ring) === 0) {
            return 0;
        }
        var result = hash(this.algorithm, key);
        var pos = this.getNodePosition(result);
        return this.ring[this.keys[pos]];
    }
    ;
    getNodePosition(result) {
        var upper = getKeysLength(this.ring) - 1;
        var lower = 0;
        var idx = 0;
        var comp = 0;
        if (upper === 0) {
            return 0;
        }
        //binary search
        while (lower <= upper) {
            idx = Math.floor((lower + upper) / 2);
            comp = compare(this.keys[idx], result);
            if (comp === 0) {
                return idx;
            }
            else if (comp > 0) {
                upper = idx - 1;
            }
            else {
                lower = idx + 1;
            }
        }
        if (upper < 0) {
            upper = getKeysLength(this.ring) - 1;
        }
        return upper;
    }
    ;
}
exports.ConsistentHash = ConsistentHash;
//# sourceMappingURL=consistentHash.js.map
export declare class ConsistentHash {
    ring: {};
    keys: any[];
    nodes: any[];
    opts: any;
    replicas: number;
    algorithm: string;
    station: any;
    constructor(nodes: any, opts: any);
    addNode(node: any): void;
    removeNode(node: any): void;
    getNode(key: any): any;
    getNodePosition(result: any): number;
}

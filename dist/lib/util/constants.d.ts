export declare var constants: {
    FAIL_MODE: {
        FAILOVER: string;
        FAILFAST: string;
        FAILSAFE: string;
        FAILBACK: string;
    };
    SCHEDULE: {
        ROUNDROBIN: string;
        WEIGHT_ROUNDROBIN: string;
        LEAST_ACTIVE: string;
        CONSISTENT_HASH: string;
    };
    DEFAULT_PARAM: {
        FAILSAFE_RETRIES: number;
        FAILSAFE_CONNECT_TIME: number;
        CALLBACK_TIMEOUT: number;
        INTERVAL: number;
        GRACE_TIMEOUT: number;
        DEFAULT_PENDING_SIZE: number;
        KEEPALIVE: number;
    };
    RPC_ERROR: {
        SERVER_NOT_STARTED: number;
        NO_TRAGET_SERVER: number;
        FAIL_CONNECT_SERVER: number;
        FAIL_FIND_MAILBOX: number;
        FAIL_SEND_MESSAGE: number;
        FILTER_ERROR: number;
    };
    TOPIC_RPC: string;
    TOPIC_HANDSHAKE: string;
};

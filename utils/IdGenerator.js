// const LongAdder = require('long-adder');
// const moment = require('moment');

/**
 * Generator for request id
 *
 * The snowflake algorithm was the earliest unique ID generation algorithm used internally by Twitter in a distributed environment.
 * It uses 64-bit long type data storage. Details as follows:
 * 0 - 0000000000 0000000000 0000000000 0000000000 0 - 0000000000 - 000000000000
 * Sign bit - Timestamp - Machine code - Serial number
 * The highest bit represents the sign bit, where 0 represents an integer, 1 represents a negative number, and ids are generally positive numbers, so the highest bit is 0.
 *
 * Implemented through the snowflake algorithm -- (no snowflake in the world is the same) 5+5+42+12=64 bits
 *  - Computer room number (data center) 5 bits
 *  - Machine number 5bit
 *  - The time originally represented by 64 bits of the timestamp (long) must be reduced to 42 bits
 *  - Serialization 12bit: The same machine number in the same computer room at the same time may require many IDs due to concurrency.
 */
class IdGenerator {
    constructor(dataCenterId, machineId) {
        if (dataCenterId > this.DATA_CENTER_MAX || machineId > this.MACHINE_MAX) {
            throw new Error("The data center number and machine number passed in are illegal");
        }
        this.dataCenterId = dataCenterId;
        this.machineId = machineId;
        this.sequenceId = 0;
        this.lastTimeStamp = -1;
    }

    static get START_STAMP() {
        return new Date("2024-01-01").getTime();
    }

    static get DATA_CENTER_BIT() {
        return 5;
    }

    static get MACHINE_BIT() {
        return 5;
    }

    static get SEQUENCE_BIT() {
        return 12;
    }

    static get DATA_CENTER_MAX() {
        return ~(-1 << this.DATA_CENTER_BIT);
    }

    static get MACHINE_MAX() {
        return ~(-1 << this.MACHINE_BIT);
    }

    static get SEQUENCE_MAX() {
        return ~(-1 << this.SEQUENCE_BIT);
    }

    static get TIMESTAMP_LEFT() {
        return this.DATA_CENTER_BIT + this.MACHINE_BIT + this.SEQUENCE_BIT;
    }

    static get DATA_CENTER_LEFT() {
        return this.MACHINE_BIT + this.SEQUENCE_BIT;
    }

    static get MACHINE_LEFT() {
        return this.SEQUENCE_BIT;
    }

    getId() {
        // Process timestamp
        let currentTime = Date.now();
        let timeStamp = currentTime - IdGenerator.START_STAMP;

        // Determine clock dialback
        if (timeStamp < this.lastTimeStamp) {
            throw new Error("Server clock rollback occurs");
        }

        // handle serial number
        if (timeStamp === this.lastTimeStamp) {
            this.sequenceId++;
            if (this.sequenceId >= IdGenerator.SEQUENCE_MAX) {
                timeStamp = this.getNextTimeStamp();
                this.sequenceId = 0;
            }
        } else {
            this.sequenceId = 0;
        }

        //Update timestamp
        this.lastTimeStamp = timeStamp;

        // Generate ID
        let sequence = this.sequenceId;
        return timeStamp << IdGenerator.TIMESTAMP_LEFT | this.dataCenterId << IdGenerator.DATA_CENTER_LEFT | this.machineId << IdGenerator.MACHINE_LEFT | sequence;
    }

    getNextTimeStamp() {
        let current = Date.now() - IdGenerator.START_STAMP;
        while (current === this.lastTimeStamp) {
            current = Date.now() - IdGenerator.START_STAMP;
        }
        return current;
    }
}

module.exports = IdGenerator;
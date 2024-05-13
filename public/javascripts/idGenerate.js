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

    static START_STAMP = new Date("2024-01-01").getTime();
    static DATA_CENTER_BIT = 5;
    static MACHINE_BIT = 5;
    static SEQUENCE_BIT = 12;
    static DATA_CENTER_MAX = ~(-1 << this.DATA_CENTER_BIT);
    static MACHINE_MAX = ~(-1 << this.MACHINE_BIT);
    static SEQUENCE_MAX = ~(-1 << this.SEQUENCE_BIT);
    static TIMESTAMP_LEFT = this.DATA_CENTER_BIT + this.MACHINE_BIT + this.SEQUENCE_BIT;
    static DATA_CENTER_LEFT = this.MACHINE_BIT + this.SEQUENCE_BIT;
    static MACHINE_LEFT = this.SEQUENCE_BIT;

    getId() {
        const currentTime = Date.now();
        let timeStamp = currentTime - IdGenerator.START_STAMP;

        if (timeStamp < this.lastTimeStamp) {
            throw new Error("The server performed a clock callback");
        }

        if (timeStamp === this.lastTimeStamp) {
            this.sequenceId = (this.sequenceId + 1) & IdGenerator.SEQUENCE_MAX;
            if (this.sequenceId === 0) {
                timeStamp = this.getNextTimeStamp();
            }
        } else {
            this.sequenceId = 0;
        }

        this.lastTimeStamp = timeStamp;
        const sequence = this.sequenceId;
        return (timeStamp << IdGenerator.TIMESTAMP_LEFT) | (this.dataCenterId << IdGenerator.DATA_CENTER_LEFT) | (this.machineId << IdGenerator.MACHINE_LEFT) | sequence;
    }

    getNextTimeStamp() {
        let current = Date.now() - IdGenerator.START_STAMP;
        while (current <= this.lastTimeStamp) {
            current = Date.now() - IdGenerator.START_STAMP;
        }
        return current;
    }
}
//
// const idGenerator = new IdGenerator(1, 1);
// console.log(idGenerator.getId());
import * as Utils from "./utils.js";

export class BlockChangeEvent {
    constructor(old, nu) {
        this.oldBlock = old;
        this.newBlock = nu;
    }

    /**
     * checks if this event fills an empty space
     * @returns true if the old block is null
     */
    isFiller() {
        return Utils.isNull(this.old);
    }

    /**
     * checks if this event removes an existing block
     * @returns true if the new block is null
     */
    isRemoval() {
        return !Utils.isNull(this.oldBlock) && Utils.isNull(this.newBlock);
    }
}
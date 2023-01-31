import * as Main from "./main.js";

export class PathFinder {
    constructor(start, end) {
        this.start = start;
        this.end = end;
        this.closed = [];
        this.open = [];
        this.step = 0;
    }

    addOpen(step) {
        this.open.push(step);
    }

    removeOpen(step) {
        for (var i = 0; i < this.open.length; i++) {
            if (this.open[i] === step) {
                this.open.splice(i, 1);
            }
        }
    }

    inOpen(step) {
        for (var i = 0; i < this.open.length; i++) {
            if (this.open[i].x === step.x && this.open[i].y === step.y)
                return this.open[i];
        }

        return false;
    }

    getBestOpen() {
        var bestI = 0;
        for (var i = 0; i < this.open.length; i++) {
            if (this.open[i].f < this.open[bestI].f) bestI = i;
        }

        return this.open[bestI];
    }

    addClosed(step) {
        this.closed.push(step);
    }

    inClosed(step) {
        for (var i = 0; i < this.closed.length; i++) {
            if (this.closed[i].x === step.x && this.closed[i].y === step.y)
                return this.closed[i];
        }

        return false;
    }

    getNeighbours(x, y) {
        let board = Main.board;

        return board.getNeighbours(x, y);
    }

    getCost(a, b, x, y) {
        let board = Main.board;

        let ab = board.affirm(a, b);
        let e = board.affirm(x, y);

        return board.getDistance(ab, e);
    }

    find() {
        var current, neighbours, neighbourRecord, stepCost, i;

        this.addOpen(new Step(this.start.x, this.start.y, this.end.x, this.end.y, this.step, false));

        while(true) {
            if(this.open.length === 0) {
                return false;
            }

            current = this.getBestOpen();
            if(current && current.x === this.end.x && current.y === this.end.y) {
                return this.buildPath(current, []);
            }

            this.removeOpen(current);
            this.addClosed(current);

            neighbours = this.getNeighbours(current.x, current.y);

            for (i = 0; i < neighbours.length; i++) {
                let n = neighbours[i];

                neighbours[i] = new Tile(n.x, n.y);
            }

            for (i = 0; i < neighbours.length; i++) {
                // Get current step and distance from current to neighbour

                let c = this.getCost(current.x, current.y, neighbours[i].x, neighbours[i].y);
                stepCost = current.g + c;

                // return;

                // Check for the neighbour in the closed set
                // then see if its cost is >= the stepCost, if so skip current neighbour
                neighbourRecord = this.inClosed(neighbours[i]);
                if (neighbourRecord && stepCost >= neighbourRecord.g) {
                    continue;
                }

                // Verify neighbour doesn't exist or new score for it is better
                neighbourRecord = this.inOpen(neighbours[i]);
                if (!neighbourRecord || stepCost < neighbourRecord.g) {
                    if (!neighbourRecord) {
                        this.addOpen(new Step(neighbours[i].x, neighbours[i].y, this.end.x, this.end.y, stepCost, current));
                    } else {
                        neighbourRecord.parent = current;
                        neighbourRecord.g = stepCost;
                        neighbourRecord.f = stepCost + neighbourRecord.h;
                    }
                }
            }
        }

        return false;
    }

    buildPath(tile, stack) {
        stack.push(tile);

        if (tile.parent) {
            return this.buildPath(tile.parent, stack);
        } else {
            return stack;
        }
    }
}

export class Tile {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

export class Step {
    constructor(xC, yC, xT, yT, totalSteps, parentStep) {
        var h = this.distanceM(xC, yC, xT, yT);

        this.x = xC;
        this.y = yC;
        this.g = totalSteps;
        this.h = h;
        this.f = totalSteps + h;
        this.parent = parentStep;
    }

    distanceM(xC, yC, xT, yT) {
        var dx = Math.abs(xT - xC), dy = Math.abs(yT - yC);
        return dx + dy;
    }
}
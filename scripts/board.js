import * as Utils from "./utils.js";
import * as Main from "./pip.js";
import * as Entities from "./entities.js";
import * as Events from "./events.js";
import * as Listeners from "./listeners.js";
import { Blank } from "./entities.js";
import { PathFinder, PathFinder2 } from "./paths.js";

export class Board {
    #board;

    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.#board = [];

        for(let i = 0; i < width; i++) {
            let yBoard = [];

            for(let j = 0; j < height; j++) {
                yBoard.push(null);
            }

            this.#board.push(yBoard);
        }
    }

    add(x, y, entity) {
        let old = this.#board[x][y];

        this.#board[x][y] = entity;

        Listeners.onBlockChange(new Events.BlockChangeEvent(old, entity));
    }

    remove(x, y) {
        this.add(x, y, null);
    }
    
    get(x, y) {
        if(x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return null;
        }

        return this.#board[x][y];
    }

    isSpaceEmpty(x, y) {
        let entity = this.get(x, y);

        return Utils.isNull(entity);
    }

    getNormalizedXDistance(a, b) {
        return Math.abs(this.getXDistance(a, b));
    }

    getNormalizedYDistance(a, b) {
        return Math.abs(this.getYDistance(a, b));
    }

    getXDistance(a, b) {
        return a.x - b.x;
    }

    getYDistance(a, b) {
        return a.y - b.y;
    }

    getDistance(a, b) {
        if(Utils.isNull(a) || Utils.isNull(b)) {
            return 0;
        }
        return this.getNormalizedXDistance(a, b) + this.getNormalizedYDistance(a, b);
    }

    getEntities() {
        let entities = [];

        for(let i = 0; i < this.width; i++) {
            for(let j = 0; j < this.height; j++) {
                if(this.isSpaceEmpty(i, j)) {
                    continue;
                } else {
                    entities.push(this.get(i, j));
                }
            }
        }

        return entities;
    }

    getAll(type) {
        return this.getEntities().filter(e => e.getName() === type);
    }

    /**
     * 
     * @param {String} type the type to find
     * @param {Entity} entity the entity to find the nearest type to
     */
    getTypeNearestTo(type, entity) {
        let entities = this.getAll(type);
        let closest = null;
        let distance = 0;

        entities.forEach(e => {
            let nDist = this.getDistance(entity, e);

            if(closest == null || nDist < distance) {
                closest = e;
                distance = nDist;
            }
        });

        return closest;
    }

    createPathTo(from, to) {
        let start = { x: from.xIndex, y: from.yIndex }

        let end = { x: to.xIndex, y: to.yIndex }

        let pathfinder = new PathFinder2(start, end);

        let paths = pathfinder.find();

        var steps = [];

        let p = paths[0];

        while(p.parent) {
            steps.unshift(this.affirm(p.x, p.y));

            p = p.parent;
        }

        steps.unshift(this.affirm(p.x, p.y));

        let last = from;
        let path = [];

        steps.forEach(p => {
            path = Utils.mix(path, this.#simplePath(last, p));
            last = p;
        });

        return path;

    }
    
    #simplePath(from, to) {
        // Utils.debug("creating path from: " + from.x + ", " + from.y + " to: " + to.x + ", " + to.y);
        let usize = Main.renderer.usize;

        let xDist = this.getXDistance(to, from);
        let yDist = this.getYDistance(to, from);

        let nx = this.getNormalizedXDistance(from, to) / usize;
        let ny = this.getNormalizedYDistance(from, to) / usize;

        let path = [];

        for(let i = 0; i < nx; i++) {
            path.push(xDist < 0 ? "left" : "right");
        }

        for(let i = 0; i < ny; i++) {
            path.push(yDist < 0 ? "up" : "down");
        }

        return path;
    }

    affirm(x, y) {
        let usize = Main.renderer.usize;
        let entity = this.get(x, y);

        if(Utils.isNull(entity)) {
            return new Entities.Blank(x * usize, y * usize);
        } else {
            return entity;
        }
    }

    getNeighbours(x, y) {
        var neighbours = [];
        
        let a = this.affirm(x + 1, y);
        let b = this.affirm(x - 1, y);
        let c = this.affirm(x, y + 1);
        let d = this.affirm(x, y - 1);

        if(a.isCollidable()) {
            neighbours.push(a);
        }

        if(b.isCollidable()) {
            neighbours.push(b);
        }

        if(c.isCollidable()) {
            neighbours.push(c);
        }

        if(d.isCollidable()) {
            neighbours.push(d);
        }

        return neighbours;
    }
}
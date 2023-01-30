import * as Utils from "./utils.js";
import * as Rend from "./renderer.js";
import * as Main from "./pip.js";

// export class Rectangle { 
//     constructor(x, y, width = Rend.renderer.usize, height = width, colour) {
//         this.x = x;
//         this.y = y;
//         this.width = width;
//         this.height = height;
//         this.colour = colour;
//     }

//     setColour(colour) {
//         this.colour = colour;
//     }

//     render() {
//         let context = Rend.renderer.getContext();

//         context.beginPath();
//         context.fillStyle = this.colour;
//         context.strokeStyle = "black";
//         context.rect(this.x, this.y, this.width, this.height);
//         context.fill();
//         context.stroke();
//     }

//     intersects(rectangle) {
//         if(rectangle === null || rectangle === undefined || !(rectangle instanceof Rectangle)) {
//             return false;
//         }

//         if(this != rectangle) {
//             return this.x == rectangle.x && this.y == rectangle.y;
//         }

//         return false;
//     }
// }

export class Entity {
    constructor(x, y, colour) {
        let usize = Rend.renderer.usize;
        this.x = x;
        this.y = y;
        this.width = usize;
        this.height = usize;

        // super(x, y, usize, usize, colour);

        if(x > 19 || y > 19) {
            Utils.debug(this.getName() + " init with pos: " + x + ", " + y);
        }

        this.xIndex = x / usize;
        this.yIndex = y / usize;
        this.colour = colour;
    }

    render() {
        let context = Rend.renderer.getContext();

        context.beginPath();
        context.fillStyle = this.colour;
        context.strokeStyle = "black";
        context.rect(this.x, this.y, this.width, this.height);
        context.fill();
        context.stroke();
    }

    isReplaceable() {
        return true;
    }

    isCollidable() {
        return true;
    }

    interact() {
        console.log("interacting with:", this.constructor.name);
    }

    getName() {
        return this.constructor.name;
    }

    equals(entity) {
        if(Utils.isNull(entity)) {
            return false;
        }

        return this.getName() === entity.getName() && this.x == entity.x && this.y == entity.y;
    }

    toString() {
        return this.getName() + ", x: " + this.x + ", y: " + this.y;
    }
}

export class Food extends Entity {
    constructor(x, y) {
        super(x, y, "yellow");
    }

    isReplaceable() {
        return false;
    }

    interact() {
        let pip = Main.pip;
        Main.board.remove(this.xIndex, this.yIndex);

        pip.hunger += 20;

        if(pip.hunger >= pip.hungerThreshold) {
            pip.starving = false;
            pip.eatTarget = Utils.randint(1, 20) + 20;
        }

        console.log("ate a piece");

        Main.updatePip(pip);
    }
}

export class Barrier extends Entity {
    constructor(x, y) {
        super(x, y, "black");
    }

    isCollidable() {
        return false;
    }
}

export class Water extends Entity {
    constructor(x, y) {
        super(x, y, "aqua");
    }

    interact() {
        console.log("drank some water");
    }
}

export class DeepWater extends Entity {
    constructor(x, y) {
        super(x, y, "blue");
    }

    isCollidable() {
        return false;
    }
}

export class Lava extends Entity {
    constructor(x, y) {
        super(x, y, "orange");
    }

    interact() {
        console.log("ouch, hot");
    }
}

export class Grass extends Entity {
    constructor(x, y) {
        super(x, y, "green");
    }
}

export class Dirt extends Entity {
    constructor(x, y) {
        super(x, y, "#6F4E37");
    }
}

export class Steel extends Entity {
    constructor(x, y) {
        super(x, y, "silver");
    }

    isCollidable() {
        return false;
    }
}

export class Stone extends Entity {
    constructor(x, y) {
        super(x, y, "gray");
    }
}

export class Bronze extends Entity {
    constructor(x, y) {
        super(x, y, "#CD7F32");
    }

    isCollidable() {
        return false;
    }
}

export class Bed extends Entity {
    constructor(x, y) {
        super(x, y, "red");
    }

    interact() {
        let pip = Main.pip;

        if(pip.sleep <= pip.sleepTarget) {
            pip.sleeping = true;
        }

        pip.sleep += Utils.randint(4, 10) + 3;
            
        if(pip.sleep > 100) {
            pip.sleep = 100;
        }

        if(pip.sleep >= pip.sleepingThreshold) {
            pip.sleeping = false;
            pip.target = null;
            pip.sleepTarget = Utils.randint(1, 20) + 30;
        }

        Main.updatePip(pip);
    }
}

export class Goal extends Entity {
    constructor(x, y) {
        super(x, y, "magenta");
    }

    interact() {
        let pip = Main.pip;
        Main.board.remove(this.xIndex, this.yIndex);
        pip.goal = null;
        console.log("reached a goal");
        Main.updatePip(pip);
    }
}

export class Blank extends Entity {
    constructor(x, y) {
        super(x, y, "white");
    }

    interact(){}
}

export class Pip extends Entity {
    #directions = ["up", "down", "left", "right"];

    #speed; #eyeSize; #w3; #w3d; #w3me; #wmed;

    constructor() {
        let usize = Rend.renderer.usize;
        let x = Utils.randint(0, 19) * usize;
        let y = Utils.randint(0, 19) * usize;

        super(x, y, "lime");

        this.reset();
    }

    reset() {
        this.#eyeSize = this.width / 8;
        this.direction = "down";
        this.#speed = 400;
        this.goal = null;
        this.target = null;

        this.#w3 = (this.width / 3);
        this.#w3d = (this.#w3 * 2);
        this.#w3me = (this.#w3 - this.#eyeSize);
        this.#wmed = (this.width - (this.#eyeSize * 2));

        this.hunger = 100;
        this.sleep = 100;
        this.mood = 100;
        this.sleeping = false;
        this.starving = false;

        this.hungerThreshold = 100;
        this.sleepingThreshold = 100;

        this.sleepTarget = Utils.randint(1, 20) + 30;
        this.eatTarget = Utils.randint(1, 20) + 20;

        this.path = null;
        this.step = 0;
        this.rerouteflag = false;
    }

    #randomizeDirection() {
        this.direction = this.#directions[Utils.randint(0, 3)];
    }

    getSpeed() {
        return this.#speed;
    }

    //for dev use only, remove when done
    setSpeed(speed) {
        this.#speed = speed;
    }

    getDirection() {
        return this.direction;
    }

    reaffirm() {
        this.#setXY(this.x, this.y);
    }

    #pickTarget() {
        let board = Main.board;

        let bed = board.getTypeNearestTo("Bed", this);
        let goal = board.getTypeNearestTo("Goal", this);
        let food = board.getTypeNearestTo("Food", this);

        let set = false;
        
        if(!Utils.isNull(bed) && (this.sleep <= this.sleepTarget)) {
           this.target = bed;
           this.sleepingThreshold = Utils.randint(1, 40) + 60;
           set = true;
        } else if(!Utils.isNull(food) && (this.starving || this.hunger <= this.eatTarget)) {
            this.target = food;
            this.hungerThreshold = Utils.randint(1, 40) + 60;
            set = true;
        } else if(!Utils.isNull(goal)) {
            // console.log(goal.equals(this.target));
            if(!goal.equals(this.target)) {
                this.target = goal;
                set = true;
            }
        } else {
            this.target = null;
        }

        if(!Utils.isNull(this.target) && (set || this.rerouteflag)) {
            this.setPath(board.createPathTo(this, this.target));
        }
    }

    setPath(path) {
        this.path = path;
        this.step = 0;
        this.rerouteflag = false;
        Utils.debug(`setting path to: ${this.path}`);
    }

    //TODO: if goal step not collidable, change step (re-route)
    //TODO: this.#setPath(). onMove, if path != null then follow path
    //TODO: if reset goal, this.#setPath() => board.createPath(this, goal);

    reroute() {
        this.rerouteflag = true;
        Utils.debug("rerouting");
    }

    move() {
        this.#pickTarget();
        if(this.sleeping) {
            this.#doSleep();
            return;
        }

        let board = Main.board;

        if(Utils.isNull(this.target)) {
            this.#randomMove();
        } else {
            let usize = Main.renderer.usize;
            let g = board.getTypeNearestTo("Goal", this);
            // let gDist = board.getDistance(g, this.target);

            if(this.target == null || board.isSpaceEmpty(this.target.xIndex, this.target.yIndex)) {
                this.#pickTarget();
                // console.log("setting goal: " + this.goal.x, this.goal.y);
            }

            let pathStep = this.path.shift();

            let xMove = 0, yMove = 0;

            switch(pathStep) {
                case("up"): {
                    yMove = -1;
                    break;
                }
                case "down": {
                    yMove = 1;
                    break;
                }

                case "right": {
                    xMove = 1;
                    break;
                }

                case "left": {
                    xMove = -1;
                    break;
                }
            }

            // Utils.debug(path);

            this.direction = pathStep;
            this.step++;
            
            // let xDist = board.getNormalizedXDistance(this, this.target) / usize;
            // let yDist = board.getNormalizedYDistance(this, this.target) / usize;

            // let doX = false;

            // // console.log(xDist, yDist);

            // if(yDist > xDist) {
            //     doX = (xDist != 0);
            // } else if(yDist == xDist) {
            //     doX = (xDist != 0) && Utils.randint(0, 100) < 50;
            // } else {
            //     doX = (yDist == 0);
            // }

            // if(doX) {
            //     if(this.target.x > this.x) {
            //         xMove = 1;
            //         this.direction = "right";
            //     } else {
            //         xMove = -1;
            //         this.direction = "left";
            //     }
            // } else {
            //     if(this.target.y > this.y) {
            //         yMove = 1;
            //         this.direction = "down";
            //     } else {
            //         yMove = -1;
            //         this.direction = "up";
            //     }
            // }

            this.#tryMove(xMove * usize, yMove * usize);
        }
    }

    #setXY(x, y) {
        let usize = Main.renderer.usize;

        this.x = x; 
        this.y = y;

        this.xIndex = this.x / usize;
        this.yIndex = this.y / usize;
    }

    #addXY(x, y) {
        this.#setXY(this.x + x, this.y + y);
    }

    #tryMove(xchange, ychange) {
        let board = Main.board;
        let renderer = Main.renderer;
        let ox = this.x, oy = this.y;
        
        this.#addXY(xchange, ychange);

        let reset = this.x < 0 || this.x >= renderer.width || this.y < 0 || this.y >= renderer.height;

        let entity = board.get(this.xIndex, this.yIndex);

        if(!Utils.isNull(entity)) {
            if(entity.isCollidable()) {
                entity.interact();
            } else {
                reset = true;
            }
        }

        if(reset) {
            this.#setXY(ox, oy);
        } else {
            this.sleep -= Utils.randint(1, 3);
            this.hunger -= Utils.randint(1, 4);

            if(this.sleep < 0) {
                this.sleep = 0;
            }

            if(this.hunger <= 0) {
                this.hunger = 0;
                this.starving = true;
                this.hungerThreshold = Utils.randint(1, 35) + 65;
            }

            if(this.sleep == 0) {
                this.sleeping = true;
                this.sleepingThreshold = Utils.randint(1, 35) + 65;
            }

            this.#calculateMood();
        }

        renderer.render();
    }

    #calculateMood() {
        if(!this.sleeping) {
            if(this.hunger == 0) {
                this.mood -= (Utils.randint(2, 8) + 2);
            } else if(this.hunger < 25) {
                this.mood -= (Utils.randint(1, 3)) + 1;
            } else if(this.hunger < 40) {
                this.mood -= Utils.randint(1, 2);
            } else if(this.hunger < 60) {
                this.mood++;
            } else if(this.hunger < 80) {
                this.mood += (Utils.randint(1, 2)) + 2;
            } else if(this.hunger <= 100) {
                this.mood += (Utils.randint(2, 4)) + 2;
            }
        }

        if(!this.sleeping) {
            if(this.sleep < 20) {
                this.mood -= (Utils.randint(1, 7)) + 2;
            } else if(this.sleep < 40) {
                this.mood -= Utils.randint(1, 4);
            }
        } else {
            this.mood += (Utils.randint(2, 6)) + 2;
        }

        if(this.mood < 0) {
            this.mood = 0;
        }

        if(this.mood > 100) {
            this.mood = 100;
        }
        //TODO
    }

    #randomMove() {
        let usize = Main.renderer.usize;

        let xchange = this.direction == "left" ? -usize : this.direction == "right" ? usize : 0;
        let ychange = this.direction == "up" ? -usize : this.direction == "down" ? usize : 0;

        this.#tryMove(xchange, ychange);

        this.#randomizeDirection();
    }

    #doSleep() {
        let entity = Main.board.get(this.xIndex, this.yIndex);
        let bed = false;

        if(!Utils.isNull(entity) && entity instanceof Bed) {
            entity.interact();
            bed = true;
        } else {
            this.sleep += (Utils.randint(1, 4) + 1);
        }

        if(this.sleep >= 100) {
            this.sleep = 100;
        }

        if(this.sleep >= this.sleepingThreshold) {
            this.sleeping = false;
            this.sleepTarget = Utils.randint(1, 20) + 30;
        }

        if(bed) {
            this.#calculateMood();
        }

        Main.renderer.render();
    }

    toString() {
       return "x: " + this.x + "\ny: " + this.y + "\ndirection: " + this.direction + "\nmood: " + this.mood + "\nhunger: " + this.hunger + "\nsleep: " + this.sleep;
    }

    render() {
        // this.#renderPath();

        super.render();

        let x, x2, y, y2;

        let vv = {
            "up" : this.y + this.#eyeSize,
            "down": this.y + this.#wmed,
            "left": this.x + this.#eyeSize,
            "right": this.x + this.#wmed
        };

        switch(this.direction) {
            case("up"):
            case("down"): {
                x = this.x + this.#w3me;
                x2 = this.x + this.#w3d;
                y = vv[this.direction];
                break;
            }

            case("left"):
            case("right"): {
                x = vv[this.direction];
                y = this.y + this.#w3me;
                y2 = this.y + this.#w3d;
                break;
            }
        }

        this.#renderEyes(x, y, x2, y2);
    }

    renderPath() {
        if(!Utils.debugMode) {
            return;
        }
        let board = Main.board;
        let context = Main.renderer.getContext();
        let usize = Main.renderer.usize;

        if(!Utils.isNull(this.target)) {
            context.strokeStyle = "black";
            context.beginPath();

            // Utils.debug(this.path);

            var lastX = this.x + (usize / 2);
            var lastY = this.y + (usize / 2);

            for(let i = 0; i < this.path.length; i++) {
                context.moveTo(lastX, lastY);
                
                let dir = this.path[i];

                // console.log(dir);

                if(dir == "left") {
                    context.lineTo(lastX -= usize, lastY);
                } else if(dir == "right") {
                    context.lineTo(lastX += usize, lastY);
                } else if(dir == "down") {
                    context.lineTo(lastX, lastY += usize);
                } else {
                    context.lineTo(lastX, lastY -= usize);
                }

                context.stroke();
            }
            // Utils.debug("not null");
            // let xDist = board.getXDistance(this, this.target);
            // let yDist = board.getYDistance(this, this.target);

            // Utils.debug(xDist,yDist);

            // let x1 = xDist < 0 ? this.x + xDist : this.x;
            // let x2 = xDist < 0 ? this.x : this.x + xDist;

            // Utils.debug("got dist");

            // context.beginPath();
            // if(this.direction == "left" || this.direction == "right") {
            //     context.moveTo(this.x + (usize / 2), this.y + (usize / 2));
            //     context.lineTo(this.x - xDist + (usize / 2), this.y + (usize / 2));
            //     context.moveTo(this.x - xDist + (usize / 2), this.y + (usize / 2));
            //     context.lineTo(this.x - xDist + (usize / 2), this.y - yDist);
            // } else {
            //     context.moveTo(this.x + (usize / 2), this.y + (usize / 2));
            //     context.lineTo(this.x + (usize / 2), this.y - yDist);
            //     context.moveTo(this.x + (usize / 2), this.y + (usize / 2));
            //     context.lineTo(this.x - xDist + (usize / 2), this.y + (usize / 2));
            // }
            // // context.drawLine(this.x + xDist, this.y, this.x + xDist, this.y + yDist)
            // context.stroke();

            // Utils.debug("e");
        }
    }

    #renderEyes(x1, y1, x2 = x1, y2 = y1) {
        let context = Rend.renderer.getContext();
        context.beginPath();
        context.fillStyle = "black";
        context.rect(x1, y1, this.#eyeSize, this.#eyeSize);
        context.rect(x2, y2, this.#eyeSize, this.#eyeSize);
        context.fill();
        context.stroke();
    }
}
import * as Main from "./pip.js";
import * as Utils from "./utils.js";
import * as Entities from "./entities.js";

export var mouseDisabled = false;
export var mouseDown = false;
export var mouse;

export function onMouseClick(e) {
    if(mouseDisabled) {
        return;
    }

    mouseDown = true;

    if(e.shiftKey || e.ctrlKey || e.altKey) {
        return;
    }

    let renderer = Main.renderer;
    let usize = renderer.usize;
    let board = Main.board;
 
    let xIndex = Math.floor((e.pageX - renderer.canvas.offsetLeft) / usize);
    let yIndex = Math.floor((e.pageY - renderer.canvas.offsetTop) / usize);

    var x = xIndex * usize;
    var y = yIndex * usize;

    if(xIndex > 19 || yIndex > 19) {
        return;
    }

    var entity = Utils.construct(Main.selectedEntity, x, y);
    
    if(!board.isSpaceEmpty(xIndex, yIndex) && Utils.matchType(entity, board.get(xIndex, yIndex))) {
        if(entity.isReplaceable()) {
            board.remove(xIndex, yIndex);
        }
    } else {
        board.add(xIndex, yIndex, entity);
    }

    renderer.render();
}

export function onMouseRelease(e) {
    mouseDown = false;
}

export function onMouseDrag(e) {
    let usize = Main.renderer.usize;
    let board = Main.board;
    let canvas = Main.renderer.canvas;
    let x = e.pageX - canvas.offsetLeft;
    let y = e.pageY - canvas.offsetTop;

    mouse = new Entities.Entity(x, y);

    if(mouseDisabled) {
        return;
    }

    let xIndex = Math.floor((x) / usize);
    let yIndex = Math.floor((y) / usize);

    let entity = board.get(xIndex, yIndex);

    if(entity !== Main.hoveredEntity) {
        Main.setHoveredEntity(entity);

        Main.renderer.render();
    }

    if(!mouseDown) {
        return;
    }

    if(xIndex > 19 || yIndex > 19) {
        return;
    }

    if(e.shiftKey || e.ctrlKey) {
        if(!Utils.isNull(entity) && entity.isReplaceable()) {
            Main.board.remove(xIndex, yIndex);

            Main.renderer.render();
        }
    } else {
        let entity = Utils.construct(Main.selectedEntity, xIndex * usize, yIndex * usize);

        board.add(xIndex, yIndex, entity);

        Main.renderer.render();
    }
}

export function onMouseWheel(e) {
    let delta = e.wheelDeltaY;

    if(delta < 0) {
        let next = Utils.getNextIn(Main.entityTypes, Main.selectedEntity);
        
        Main.setSelectedEntity(next);
    } else if(delta > 0) {
        Main.setSelectedEntity(Utils.getPreviousIn(Main.entityTypes, Main.selectedEntity)); 
    } else {
        return;
    }
    
    Main.renderer.drawExcessPanel();

}

export function onKeyPress(e) {
    let code = e.keyCode;

    if(code == 27) { //ESC
        if(!Main.started) {
            Main.start();
        } else {
            Main.stop();
        }

        Main.renderer.render();

        return;
    }

    return;
}

export function onKeyRelease(e) {
    let char = String.fromCharCode(e.keyCode);
}

export function onBlockChange(e) {
    Main.pip.reroute();
}

export function onMouseEnter(e) {
    mouseDisabled = false;
}

export function onMouseLeave(e) {
    mouseDisabled = true;
    mouseDown = false;
}
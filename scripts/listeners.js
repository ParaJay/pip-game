import * as Main from "./main.js";
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
    let board = Main.board;
    let usize = renderer.usize;

    let x = Math.floor((e.pageX - renderer.canvas.offsetLeft) / usize);
    let y = Math.floor((e.pageY - renderer.canvas.offsetTop) / usize);

    if(x > 19 || y > 19) {
        return;
    }

    var entity = Utils.construct(Main.selectedEntity, x, y);
    
    if(!board.isSpaceEmpty(x, y) && Utils.matchType(entity, board.get(x, y))) {
        if(entity.isReplaceable()) {
            board.remove(x, y);
        }
    } else {
        board.put(x, y, entity);
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
    let x = Math.floor((e.pageX - canvas.offsetLeft) / usize);
    let y = Math.floor((e.pageY - canvas.offsetTop) / usize);

    mouse = new Entities.Entity(x, y);

    if(mouseDisabled) {
        return;
    }

    let entity = board.get(x, y);

    if(entity !== Main.hoveredEntity) {
        Main.setHoveredEntity(entity);

        Main.renderer.render();
    }

    if(!mouseDown) {
        return;
    }

    if(x > 19 || y > 19) {
        return;
    }

    if(e.shiftKey || e.ctrlKey) {
        if(!Utils.isNull(entity) && entity.isReplaceable()) {
            Main.board.remove(x, y);

            Main.renderer.render();
        }
    } else {
        let entity = Utils.construct(Main.selectedEntity, x, y);

        board.add(entity);

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
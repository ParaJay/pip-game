import * as Main from "./pip.js";
import * as Utils from "./utils.js";
import * as Listeners from "./listeners.js";

const fontsize = 48, font = `${fontsize}px arial`;

export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.width = canvas.width - (canvas.width / 4);
        this.height = canvas.height;
        this.xOffset = (canvas.width / 4);
        this.context.font = font;
        this.context.lineWidth = 2;
        this.usize = this.width / 20;
    }

    getCanvas() {
        return this.canvas;
    }

    getContext() {
        return this.context;
    }

    setUniversalSize(size) {
        this.usize = size;
    }

     render() {
        this.clear();
    
        this.drawBorder();
    
        this.drawExcessPanel();

        Main.pip.renderPath();
    
        Main.board.getEntities().forEach(val => {
            val.render();
        });
    
        // Main.pip.renderPath();
        Main.pip.render();
    
        if(!Main.started) {
            let text = "Press ESC to Begin";
            this.context.beginPath();
            this.context.font = font;
            this.context.fillStyle = "black";
            this.context.fillText(text, this.centerTextX(text), this.height / 2);
            this.context.stroke();

        }
    
        this.renderTooltip();
    }
    
     renderTooltip() {
        if(!Utils.isNull(Main.hoveredEntity)) {
            let y = Main.hoveredEntity.yIndex == 0 ? Main.hoveredEntity.y + (this.usize * 1.5) : Main.hoveredEntity.y - (this.usize / 2);
            this.context.beginPath();
            this.context.font = "bold 12px arial"
            this.context.fillStyle = "black";
            this.context.fillText(Main.hoveredEntity.getName(), (Main.hoveredEntity.x), y);
            this.context.stroke();
        }
    }
    
     clear(x = 0, y = 0, w = this.canvas.width, h = this.canvas.height) {
        this.context.beginPath();
        this.context.fillStyle = "white";
        this.context.strokeStyle = "white";
        this.context.rect(x, y, w, h);
        this.context.fill();
        this.context.stroke();
    }
    
     drawGrid() {
        for(let i = 1; i < 20; i++) {
            let x = i * (width / 20);
            let y = i * (width / 20);
            
            this.context.beginPath();
            this.context.moveTo(0, y);
            this.context.lineTo(width, y);
            this.context.stroke();
            
            this.context.beginPath();
            this.context.moveTo(x, 0);
            this.context.lineTo(x, height);
            this.context.stroke();
        }
    }
    
     drawLine(x1, y1, x2 = x1, y2 = y1, colour = this.context.strokeStyle, width = 4) {
        this.context.beginPath();
        this.context.strokeStyle = colour;
        this.context.lineWidth = width;
        this.context.moveTo(x1, y1);
        this.context.lineTo(x2, y2);
        this.context.stroke();
    }
    
     drawBorder() {
        this.context.strokeStyle = "#ff0000";
        this.context.setLineDash([8, 4]);
    
        this.drawLine(this.width, 0, this.width, this.height);
    
        this.context.setLineDash([]);
        this.context.strokeStyle = "black";
        this.context.lineWidth = 2;
    }
    
     drawExcessPanel() {
        this.clear(this.width + 2);
    
        this.context.font = "12px arial";
        this.context.fillStyle = "black";
    
        let x = (this.canvas.width) - (this.xOffset / 2);
        let y = this.height / 20;
    
        let text = "Selected: " + Main.selectedEntity;
        let entity = Utils.construct(Main.selectedEntity, 0, 0);
    
        this.context.beginPath();
        this.context.fillText(text, this.centerTextX(text, x), this.height / 20);
        this.context.stroke();
        
    
        if(entity !== null) {
            let textb = "Collidable: " + entity.isCollidable();
    
            this.context.beginPath();
            this.context.fillText(textb, this.centerTextX(textb, x), y + (this.usize));
            this.context.stroke();
        }

        let pip = Main.pip;
    
        let target = !Utils.isNull(pip.target) ? pip.target.getName() : "null";
    
        let texts = ["Food Level: " + pip.hunger, "Sleep Level: " + pip.sleep, "Mood: " + pip.mood, "Target: " + target, "Sleep Target: " + pip.sleepTarget, "Eat Target: " + pip.eatTarget];
    
        let iY = (y + this.usize);
    
        this.context.beginPath();
    
        for(let i = 0; i < texts.length; i++) {
            let t = texts[i];
    
            this.context.fillText(t, this.centerTextX(text, x), iY + ((i + 1) * this.usize));
        }
    
        this.context.stroke();
    }

    /**
     * 
     * @param {Number} text 
     * @returns an integer value used in context.fillText to allow text to be centered along the x-axis
     */
    centerTextX(text, xPos = (this.width / 2)) {
        let metrics = this.context.measureText(text);

        let x = (xPos) - (metrics.width / 2);

        return x;
    }

    initListeners() {
        window.addEventListener('keydown', Listeners.onKeyPress, false);
    
        this.canvas.onmousedown = Listeners.onMouseClick;
        this.canvas.onmouseup = Listeners.onMouseRelease;
        this.canvas.onmousemove = Listeners.onMouseDrag;
        this.canvas.onmousewheel = Listeners.onMouseWheel;
        this.canvas.onmouseleave = Listeners.onMouseLeave;
        this.canvas.onmouseenter = Listeners.onMouseEnter;
    }
}

 export function init(canv) {
    renderer = new Renderer(canv);
}

export var renderer;
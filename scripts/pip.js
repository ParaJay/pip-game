//TODO: make path finding 
//TODO: make function that finds the nearest bit of food    ????
//TODO: add textures for entities
//TODO URGENT: LISTENERS

import * as Entities from "./entities.js";
import {Board} from "./board.js";
import * as Rend from "./renderer.js";
import * as Utils from "./utils.js";

window.onload = () => {
    let canvas = document.getElementById('my-canvas'); //load the canvas
    
    init(canvas); //load our init
}

export var board;
export var started = false;
const fontsize = 48, font = `${fontsize}px arial`;
export var selectedEntity = "Food";
export const entityTypes = ["Food", "Barrier", "Water", "DeepWater", "Lava", "Grass", "Dirt", "Steel", "Stone", "Bronze", "Goal", "Bed", "Remove"];
export var hoveredEntity;
export var renderer;

export var pip;

function init(canv) {
    Utils.setDebugMode(true);
    
    Rend.init(canv);

    renderer = Rend.renderer;

    board = new Board(20, 20);

    renderer.initListeners();
    
    pip = new Entities.Pip();
    
    createButton("Load", load);
    createButton("Save", save);

    if(Utils.debugMode) {
        // start();
    }

    renderer.render();
}

export function setSelectedEntity(e) {
    selectedEntity = e;
}

export function setHoveredEntity(e) {
    hoveredEntity = e;
}

export async function start() {
    started = true;

    while(started) {
        pip.move();

        await Utils.sleep(pip.getSpeed());
    }

    renderer.render();
}

export function stop() {
    started = false;
}

function load() {
    var textfile = document.createElement("INPUT");

    textfile.setAttribute("type", "file");

    textfile.style.display = "none";

    textfile.addEventListener("input", (e) => {
        let file = e.target.files[0];

        if(file) {
            var reader = new FileReader();
            reader.readAsText(file, "UTF-8");
            reader.onload = (e) => {
                parse(e.target.result);
            };
        }

        textfile.remove();
    });

    document.body.appendChild(textfile);
    
    textfile.click();
}

function save() {
    let text = "def pip\n" + pip.toString();

    let entities = board.getEntities();

    if(entities.length > 0) {
        text = text + "\ndef board";

        entities.forEach(entity => {
            text = text + "\n" + entity.constructor.name + ": " + entity.x + " " + entity.y;
        });
    }

    // console.log(pip);
    const link = document.createElement("a");
    var file = new Blob([text], {
        type: "text/plain;charset=utf-8"
    });
    link.href = URL.createObjectURL(file);
    link.download = "pet.txt";
    document.body.appendChild(link);
    link.click();
    URL.revokeObjectURL(link.href);
    // window.focus();
}

function parse(data) {
    let lines = data.split("\n");

    var selection = "";

    board = new Board(20, 20);
    pip.reset();
    
    lines.forEach(line => {
        if(line.includes("def ")) {
            selection = line.replace("def ", "");
        } else {
            let values = line.split(": ");

            let key = values[0];
            let value = values[1];

            if(selection === "pip") {
                if(key in pip) {
                    if(!isNaN(value)) {
                        value = parseFloat(value);
                    }
    
                    pip[key] = value;
                }
            } else if(selection == "board") {
                let coords = value.split(" ");

                let x = parseFloat(coords[0]);
                let y = parseFloat(coords[1]);

                let entity = Utils.construct(key, x, y);

                board.add(entity.xIndex, entity.yIndex, entity);
            }
        }
    });

    pip.reaffirm();

    renderer.render();
}

function createButton(text, func, parent = document.body, append = true) {
    var button = document.createElement("BUTTON");

    var buttonText = document.createTextNode(text);

    button.appendChild(buttonText);
    button.onclick = func;

    if(append) {
        parent.appendChild(button);
    } else {
        parent.insertBefore(button, document.body.firstChild);
    }
}

export function updatePip(p) {
    pip = p;
}
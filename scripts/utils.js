import * as Entities from "./entities.js";
import * as Main from "./main.js";

export var debugMode;

export function randint(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min + 1) + min);
}

export function debug(...t) {
    if(debugMode) {
        let s = "";

        t.forEach(e => {
           s += ((s.length == 0 ? "" : ", ") + e.toString());
        });
        console.log(s);
    }
}

export function setDebugMode(mode) {
    debugMode = mode;
}

export function construct(className, ...args) {
    try {
        var obj = eval(`new Entities.${className}(${args})`);

        return obj;
    }catch(Error) {
        return null;
    }
}

export function createButton(text, func, parent = document.body, append = true) {
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

export function getNextIn(array, current) {
    let index = array.indexOf(current);

    if(index + 1 >= array.length) {
        index = 0;
    } else {
        index++;
    }

    return array[index];
}

export function getPreviousIn(array, current) {
    let index = array.indexOf(current);

    if(index == 0) {
        index = array.length - 1;
    } else {
        index--;
    }

    return array[index];
}

/**
 * 
 * @param {Entity} entitya 
 * @param {Entity} entityb 
 * @param {*} falsifyNull if true then will return false if either is null, if false then will return true if either is null
 * @returns 
 */
export function matchType(entitya, entityb, falsifyNull = true) {
    if((entitya === null || entityb === null)) {
        return !falsifyNull;
    }

    return entitya.getName() === entityb.getName();
}

export function isNull(a) {
    return a === null || a === undefined;
}

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function mix(arr1, arr2) {
    arr2.forEach(e => {
        arr1.push(e);
    });

    return arr1;
}
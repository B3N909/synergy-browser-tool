const fs = require("fs");
const colors = require("colors");
const electronBuilder = require("electron-builder");
const ob = require("javascript-obfuscator");

console.log("Starting".gray + " build".green);
console.log("\n\n\n\n");

let BrowserInstance = fs.readFileSync("./BrowserInstance.js", "utf8");
let BrowserManager  = fs.readFileSync("./BrowserManager.js", "utf8");
let index           = fs.readFileSync("./index.js", "utf8");
let viewIndex       = fs.readFileSync("./views/index.js", "utf8");
let viewHTML        = fs.readFileSync("./views/index.html", "utf8");

let splice = (str, s, e, exclude) => {
    let start = str.indexOf(s);
    let end = str.indexOf(e);
    if(exclude) {
        return str.substring(0, start) + str.substring(end, str.length);
    } else {
        return str.substring(start, end);
    }
}


let newIndex = splice(index, "// DEV-IMPORTS-START", "// DEV-IMPORTS-END", true);
let pageWrapper = splice(BrowserInstance, "// PAGE-WRAPPER-START", "// PAGE-WRAPPER-END") + " module.exports = PageWrapper;";
let browserInstance = splice(BrowserInstance, "// BROWSER-INSTANCE-START", "// BROWSER-INSTANCE-END");
let browserManager = splice(BrowserManager, "// BROWSER-MANAGER-START", "// BROWSER-MANAGER-END");

let buildIndex = "const PageWrapper = require('./PageWrapper.js'); " + browserInstance + browserManager + newIndex;

const o = {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.75,
    numbersToExpressions: true,
    simplify: true,
    stringArrayShuffle: true,
    splitStrings: true,
    stringArrayThreshold: 1,
    deadCodeInjection: true,
    deadCodeInjectionThreshold: 0.4,
    debugProtection: true,
    debugProtectionInterval: 0,
    disableConsoleOutput: true,
}

buildIndex = ob.obfuscate(buildIndex, o).getObfuscatedCode();
viewIndex = ob.obfuscate(viewIndex, o).getObfuscatedCode();

fs.writeFileSync("./build/PageWrapper.js", pageWrapper);
fs.writeFileSync("./build/index.js", buildIndex);
fs.writeFileSync("./build/views/index.js", viewIndex);
fs.writeFileSync("./build/views/index.html", viewHTML);

console.log("Build finished!".green);
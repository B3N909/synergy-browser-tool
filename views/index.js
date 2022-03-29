//#region IMPORTS
const request = require("request");
const uuid = require("uuid-random");
const electron = require("electron");
const fs = require("fs");
const prompt = require("electron-prompt");
const dialog = electron.remote.dialog;
const path = require("path");
const interact = require("interactjs");

const amdLoader = require("monaco-editor/min/vs/loader.js");
const amdRequire = amdLoader.require;
const amdDefine = amdRequire.define;

let isEditing = 0;

amdRequire.config({
    baseUrl: "views/monaco-editor/min"
});
self.module = undefined;

const createMonacoEditor = (container, value, changeCallback) => {
    amdRequire(["vs/editor/editor.main"], () => {
        const editor = monaco.editor.create(container, {
            value,
            language: "json",
            automaticLayout: true,
            theme: "vs-dark",
        });
        editor.getModel().onDidChangeContent((e) => {
            changeCallback(e, editor);
        });
    });
};

const remote = electron.remote;
const ipcRenderer = electron.ipcRenderer;


const detachedBody = $("body").children().not("script");
detachedBody.detach();
console.log(detachedBody);

$(`<div class="realBody body"></div>`).appendTo($("body"));
detachedBody.appendTo($(".realBody"));
//#endregion


let previewItem = false;


// setInterval(() => {
//     if(previewItem) {
//         ipcRenderer.send("grabPreview", previewItem);
//     }
// }, 100);

const updatePreview = () => {
    if(previewItem) {
        ipcRenderer.send("grabPreview", previewItem);
    }
}

const flexFill = $(`<div class="flexfill"></div>`);
flexFill.insertAfter($(".topbar .header"));

let replicateInputs = false;

const previewImage = $($(".preview img")[0]);
const tasksList = $(".taskslist");
const closeButton = $($(".circle")[2]);
const minimizeButton = $(".circle-yellow");
const maximizeButton = $(".circle-green");


const replicateInputsButton = $("#replicateInputs");
const replicateInputsImage = $("#replicateInputs img");

const useElementButton = $("#useSelectors");
const useElementImage = $("#useSelectors img");


const noTasksPreview = $(".notaskslabel2");
const previewElement = $(".previewregion .preview");
const previewRegion = $(".previewregion");
const topbar = $(".realbody .topbar");

const newTask = $(".newtask");

const browserBackButton = $($(".circle-icon-button")[0]);
const browserForwardButton = $($(".circle-icon-button")[1]);
const browserDuplicateButton = $($(".circle-icon-button")[2]);
const browserSearchButton = $($(".circle-icon-button")[3]);
const spamButton = $($(".circle-icon-button")[4]);


const createVirtualWindow = (filePath, json, callback) => {
    isEditing++;
    let fileName = filePath.replace(/^.*[\\\/]/, '');
    const virtualWindow = $(`<div class="virtualwindow">
    <div class="topbar">
      <div class="header">${fileName}</div>
      <div class="controlbuttons">
        <div class="circle"></div>
      </div>
    </div>
    <div class="virtualbody">

    </div></div>`);

    const topbar = virtualWindow.find(".topbar");

    virtualWindow.hide();
    virtualWindow.fadeIn(100);
    virtualWindow.insertAfter($("#vhere"));
    // virtualWindow.draggable();

    const targetElement = virtualWindow[0];

    const position = {
        x: 0,
        y: 0
    };

    const offset = {
        x: 0,
        y: 0
    };

    interact(topbar[0]).draggable({
        listeners: {
            start (event) {
                
            },
            move (event) {
                position.x += event.dx;
                position.y += event.dy;
      
                virtualWindow[0].style.transform = `translate(${position.x}px, ${position.y}px)`
            },
        }
    });

    interact(virtualWindow[0]).resizable({
        edges: { top: true, left: true, bottom: true, right: true },
        // invert: 'reposition',
        listeners: {
            move: (event) => {
                const { width, height } = event.rect
      
                offset.x += event.deltaRect.left
                offset.y += event.deltaRect.top
                
                Object.assign(targetElement.style, {
                    width: `${width}px`,
                    height: `${height}px`,
                    // transform: `translate(${offset.x}px, ${offset.y}px)`
                });
            }
        }
    });


    virtualWindow.find(".circle").click(() => {
        isEditing--;
        virtualWindow.fadeOut(100, () => virtualWindow.remove())
    });
    createMonacoEditor(virtualWindow.find(".virtualbody")[0], json, (e, editor) => {
        const stringValue = editor.getValue().toString().replaceAll("\n", "").replaceAll("\t", "");
        try {
            const jsonValue = JSON.parse(stringValue);
            fs.writeFileSync(filePath, JSON.stringify(jsonValue), "utf8");
            console.log("Saved content!");
            if(callback) {
                callback(jsonValue);
            }
        } catch (err) {}
    });
};
let isPromptingVariable = false;

const promptVariable = (uuid) => {
    return new Promise(r => {
        if(!uuid) uuid = previewItem;
        isPromptingVariable = true;
        const input = $(`<div class="variableInput"><input type="text" placeholder="Variable name"></div>`);
        input.appendTo($("body"));
    
        const done = (value) => {
            isPromptingVariable = false;
            input.remove();
            $("body").css("background-color", "transparent");
            $(".realBody").css("opacity", "1");

            r(value);
        }

        console.log("UUID: " + uuid);
        if(varsSheets.has(uuid) && varsSheets.get(uuid).data && varsSheets.get(uuid).data.vars) {
        
            
            let json = varsSheets.get(uuid).data;
            let keys = Object.keys(json.vars);
    
    
            let data = [];
            for(let i = 0; i < keys.length; i++) {
                let key = keys[i];
                data.push({
                    text: key,
                    value: key,
                });
            }
            new PickleComplate({
                data,
                config: {
                    type: "local",
                    target: ".variableInput",
                    clickCallback: (target, node) => {
                        done(node.value);
                    }
                }
            });
    
            input.children("input").on("keydown", (e) => {
                if(e.keyCode === 13) {
                    done(input.children("input").val());
                } else if(e.key === "Escape") {
                    done(false);
                }
            });
            
            $("body").css("background-color", "black");
            $(".realBody").css("opacity", "0.4");
        } else {
            // prompt error, no variable sheet
            done(false);
        }
    });
}

const tasksPanel = $(".taskspanel");
const mainPreview = $(".previewregion .preview");

interact(mainPreview[0]).resizable({
    edges: { top: false, left: false, bottom: true, right: false },
    listeners: {
        move: (event) => {
            const { width, height } = event.rect
            Object.assign(mainPreview[0].style, {
                width: `${width}px`,
                height: `${height}px`,
            });
        }
    }
})

interact(tasksPanel[0]).resizable({
    edges: { top: false, left: true, bottom: false, right: false },
    listeners: {
        move: (event) => {
            const { width, height } = event.rect
            Object.assign(tasksPanel[0].style, {
                width: `${width}px`,
            });
        }
    }
});

setInterval(() => {
    $(".newtask").css("width", $(".taskspanel").css("width"));

    $(".previewContainer p").css("width", $(".previewContainer .preview img.image").css("width"));
}, 10);




const recordButtons = $(`<div class="sidebuttoncontainer recordsidebuttons"></div>`);

const playbackButton = $(`<div class="circle-icon-button m-b"><img src="images/play-circle.png" loading="lazy" alt="" class="circle-image ci-small"></div>`);
const recordButton = $(`<div class="circle-icon-button m-b"><img src="images/video.png" loading="lazy" alt="" class="circle-image ci-small"></div>`);
const editPlaybackButton = $(`<div class="circle-icon-button"><img src="images/data.png" loading="lazy" alt="" class="circle-image ci-small"></div>`);




const optionButtons = $(`<div class="sidebuttoncontainer recordsidebuttons"></div>`);

const waitForButton = $(`<div class="circle-icon-button m-b"><img src="images/clock.png" loading="lazy" alt="" class="circle-image ci-small"></div>`);




playbackButton.appendTo(recordButtons);
recordButton.appendTo(recordButtons);
editPlaybackButton.appendTo(recordButtons);
recordButtons.insertAfter($($(".sidebuttoncontainer")[0]));

waitForButton.appendTo(optionButtons);
optionButtons.insertAfter($($(".sidebuttoncontainer")[0]));



tippy("#replicateInputs", { content: "Duplicate browser interactions across all browsers running" });
tippy("#useSelectors", { content: "When interacting, use elements selectors instead of absolute pixel data" });

tippy($(".circle-icon-button")[0], { allowHTML: true, content: "Go back" });
tippy($(".circle-icon-button")[1], { allowHTML: true, content: "Go forward" });
tippy($(".circle-icon-button")[2], { allowHTML: true, content: "<strong>Wait for 1s</strong><br>Useful when recording, can be edited later for a different time" });
tippy($(".circle-icon-button")[3], { allowHTML: true, content: "Playback recording" });
tippy($(".circle-icon-button")[4], { allowHTML: true, content: "<strong>Start recording</strong><br>Records all click, type, and scrolls to a JSON" });
tippy($(".circle-icon-button")[5], { allowHTML: true, content: "Edit recording" });
tippy($(".circle-icon-button")[6], { allowHTML: true, content: "Duplicate browser" });
tippy($(".circle-icon-button")[7], { allowHTML: true, content: "Change URL" });
tippy($(".circle-icon-button")[8], { allowHTML: true, content: '<strong style="text-align: center;">Spam Mode</strong><br>When clicking on a button that sends a network request, the request will be spammed at a interval' });
tippy($(".newtask")[0], { followCursor: "horizontal", content: "Create a new browser" });

$($(".circle-icon-button")[8]).css("margin-top", "5px");


ipcRenderer.on("foundXHR", () => {
    boxRipple(1, 1, 0, 0);
});

// relative percentages only
let boxRipple = (width, height, x, y) => {
    const rect = $(".previewregion .preview img")[0].getBoundingClientRect();

    const e = $(`<div class="boxRipple"></div>`).appendTo($(".realBody"));
    e.css("width", `${width * rect.width}px`);
    e.css("height", `${height * rect.height}px`);
    e.css("left", `${rect.left + (rect.width * x)}px`);
    e.css("top", `${rect.top + (rect.height * y)}px`);

    const rippleSpan = $(`<span></span>`).appendTo(e);
    rippleSpan.css("left", `${(lastClickXRel - x) * (rect.width)}px`);
    rippleSpan.css("top", `${(lastClickYRel - y) * (rect.height)}px`);

    setTimeout(() => {
        rippleSpan.remove()
        e.fadeOut(100, () => e.remove());
    }, 200);
}

const rippleEffect = (parent, x, y) => {
    const ripple = $("<div class='ripple'></div>");
    
    const rect = $(".previewregion .preview img")[0].getBoundingClientRect();


    ripple.appendTo(parent);
    ripple.css("left", `${(rect.left + (rect.width * x))}px`);
    ripple.css("top", `${(rect.top + (rect.height * y))}px`);
    ripple.css("animation", "ripple-effect .5s  linear");

    ripple[0].onanimationend = () => ripple.remove();
 }


let readyBrowsers = [];

const FastAverageColor = require("fast-average-color");
const fastAverageColor = new FastAverageColor();




// TODO: FEATURES
// TODO: 
// TODO: * Browser tabs are shown in one interface, with a preview even if the browser is not active
// TODO: * Browser interactions can be optionally streamed to all non-active browsers
// TODO: * Browser interactions are serialized to JSON (recordings)
// TODO: * -> Interactions can be recorded to a JSON file on demand
// TODO: * -> Interactions can be playedback on demand
// TODO: * -> JSON Recordings can be edited in a integrated text-editor inside the interface
// TODO: * Interactions can be switched in realtime (on hotkey or switch) to be absolute, or relative
// TODO: * -> Absolute interactions- use pixel data for event coordinates, ex: click at (0.85, 0.9) % screen
// TODO: * -> Relative interactions- use the page elements interacted with for events, ex: click on element with id "myElement"
// TODO: * Browsers can emulate mobile devices, beyond what is possible with injected JavaScript (custom built chromium version)
// TODO: * Interface is simple, intuitive, and resizable to fit your needs
// TODO: * Browsers are invisible, and streamed and real time to the interface - no more millions of background browsers, and infinite tabs
// TODO: * Abstracted terminology inside the recording JSON file to make complex tasks easy and readable


// TODO: DO BEFORE NEXT RELEASE: 3/27/2020
// TODO: decide to ship with either electron or puppeteer? if electron fix random freezes
// TODO: Speed up interactions, last step
// TODO: Bug test
// TODO: RELEASE BUILD


// TODO: Better cleanup
// TODO: MAKE ANY SELECT EXPAND WHEN HOVERING, ALLOW MULTIPLE SELECTS TO BE SHOWN
// TODO: BEFORE BETA RELEASE
// TODO: Fix keyarray & keyelementarray
// TODO:
// TODO: Change SELECT
// TODO: -> Change Select so that on recording, it skips the last click event and swaps for select event
// TODO: -> Change Select so that it works with clickElement
// TODO: -> Tab on keyarray & keyelementarray
// TODO: GOOD IDEA! ELECTRON IPC COMMUNICATION WRAPPER FOR 2 WAY MESSAGES, OR MULTI WAY MESSAGES
// TODO: Dialog wrapper to auto re-open the same directory
// TODO: FEATURE IDEAS
// TODO: * Request library
// TODO: * Recording of spam events / 
// TODO: 


// TODO: Wrapper that creates fullscreen windows for different monitors by stitching the body using css to be -x position and wider width?
// TODO: Otherwise just a general multiscreen wrapper?

// TODO: ADD REQUEST LIBRARY !? !?
// TODO: ADD JS LIBRARY      !? !?
// TODO:
// TODO: Remove wait after relative click in place for waitForElement of element at that position?


// TODO: TOMORROW 3/24/2020
// TODO: Test with a lot of browsers
// TODO: Lots of testing
// TODO: Get build out!



// TODO: removed feature - !!! BIG PROBLEM !!! this._recentClick this is undefined in _click when retrying !!! BIG PROBLEM !!!


// TODO: DONE! async events inside BrowserManage ipcMain.on
// TODO: DONE! Border glow around selected browser
// TODO: DONE! Queue text is not right align correctly
// TODO: DONE! if waitFor is too long, refresh page + retry
// TODO: DONE! Select crashes, does not work
// TODO: DONE! Only accept mouse down if cursor is over preview img

// TODO: * ADDRESS THE FACT THAT ON DROPS ITS NOT GOING TO BE AS SIMPLE AS USING A QUEUE SYSTEM, ADD TO CART WILL BE AN ISSUE, MAYBE ADD RETRY AFTER X BUILT IN?
// TODO: * BUG TEST.
// TODO: * BUG TEST THE FUCK OUTTA THIS
// TODO: * EVEN MORE BUG TESTING HOMES
// TODO: * MAKE BUILD AVAILABLE, GET PR GOING HOMES

// TODO: Record request interactions that happen from a click event
// TODO: -> if requests happen && request recording mode is on, prompt for add request && lock page
// TODO: Network recording playback
// TODO: OVERRIDE XHR REQUESTS
// TODO: -> Only useful for multiplying requests to the same response handler
// TODO: -> FIND A WAY TO CALL RESPONSE HANDLER AFTER THE FACT

// TODO: REBUILD CHROMIUM WITH SAME PROFILING
// TODO: -> REMOVE DEBUGGER
// TODO: -> -> Maybe implement advanced XHR duplication


/**
 * IDEAS
 * + CDP Animations
 * + SPAM MODE
 * 
 * 
 */

// TODO: SPAM MODE, When enabled catch requests that happen from click, and spam them until successful


// TODO: DO BEFORE FINAL FIRST RELEASE
// TODO: Cleanup commands, make sure you can generate your own file from scratch
// TODO: Completely overhaul and cleanup code - MAKE SURE NO WEIRD BUGS EXIST IN LESSER TYPED AREAS OF CODE
// TODO: Authenticate google login in backend, record email in database







// TODO: Maybe have a per browser variable sheet
// TODO: -> Variables can be used for selector type in realtime
// TODO: -> -> For ex: variable of item name is different for each browser




// TODO: FEATURE IDEAS
// TODO: Fullscreen mode, auto span elements correctly
// TODO: Later change keyarray to be used and not just a term used when scripting
// TODO: Recording of network interactions may be useful in some circumstances
// TODO: Maybe selector for only on a hotkey do relative
// TODO: 
// TODO:
// TODO:
// TODO:
// TODO:
// TODO: Better waits
// TODO: ->  wait for request, if request includes response data
// TODO: ->  wait for network idle








// TODO: COMPLETED:
// TODO: <- Much better is in the middle of loading script, works with react and dynamic page content
// TODO: <- Add wait button
// TODO: <- Virtual window mode, add VSCode JSON editor, open file prompt
// TODO: <- Add keyarray property as a helper for typing



// TODO: Website for Stripe integration

let lastClickX, lastClickY;
let lastClickXRel, lastClickYRel;


ipcRenderer.on("promptEventType", (e, d) => {
    let middleClick = d.middleClick;
    popupType(middleClick);
});

ipcRenderer.on("showError", (e, data) => {
    showError(data.url);
});

let showError = (url) => {

    const e = $(`<div class="error"></div>`);
    $(`<h1>Error, execution halted.</h1>`).appendTo(e);
    $(`<h2>${url}</h2>`).appendTo(e);
    e.appendTo(".realBody");
    e.css("bottom", `${($(".error").length * 60)}px`);


    let timeout = setTimeout(() => {
        e.fadeOut(200, () => {
            e.remove()
        });
    }, 2000);
    e.click(() => {
        clearTimeout(timeout);
        e.fadeOut(200, () => e.remove());
    });
}

const popupType = (middleClick) => {
    if($(".popupType").length > 0) {
        $($(".popupType").children("button")[0]).click();
        // ipcRenderer.send("eventTypeSelected", {
        //     type: "cancelled",
        // });
    }
    const e = $(`<div class="popupType">
    <button>Full Path</button>
    <button>Text</button>
    <button>Keywords</button>
    </div>`);
    e.appendTo($(".realBody"));


    // e.css("left", `${lastClickX - (parseFloat(e.css("width").split("px")[0]) / 2)}px`);
    // e.css("top", `${lastClickY - (parseFloat(e.css("height").split("px")[0]) / 2)}px`);
    e.css("left", `${lastClickX}px`);
    e.css("top", `${lastClickY}px`);
    e.children("button").click(async (a, b, c) => {
        const val = $(a.target).text();
        if(middleClick) {
            const variableName = await promptVariable();
            if(!variableName) {
                ipcRenderer.send("eventTypeSelected", {
                    type: val,
                });
            } else {
                ipcRenderer.send("eventTypeSelected", {
                    type: val,
                    variableName,
                });
            }
        } else {
            ipcRenderer.send("eventTypeSelected", {
                type: val,
            });
        }
        e.fadeOut(125, () => e.remove());
    });
}
let isMouseEnter = false;
let isSpamming = false;
let isRecording = false;
let isPlayback = false;
let isStoppingPlayback = false;

spamButton.click(() => {
    isSpamming = !isSpamming;
    if(isSpamming) {
        spamButton.css("opacity", "0.5");
        ipcRenderer.send("spam", {
            spam: isSpamming,
            uuid: previewItem
        });
    } else {
        spamButton.css("opacity", "1");
        ipcRenderer.send("spam", {
            spam: isSpamming,
            uuid: previewItem
        });
    }
});

playbackButton.click(() => {
    if(isStoppingPlayback) {
        return;
    }

    if(!isRecording && !isPlayback) {
        isPlayback = true;
        playbackButton.css("opacity", "0.2");
        ipcRenderer.send("startPlayback", {
            uuid: previewItem,
            replicateInputs,
        });
    }
    if(isPlayback) {
        isStoppingPlayback = true;
        console.log("Stopping playback");
        ipcRenderer.send("stopPlayback", {
            uuid: previewItem,
            replicateInputs
        });
    }
});

ipcRenderer.on("playbackComplete", () => {
    isPlayback = false;
    isStoppingPlayback = false;
    isRecording = false;
    recordButton.css("opacity", "1");
    playbackButton.css("opacity", "1");
});

editPlaybackButton.click(async() => {
    const file = await dialog.showOpenDialog({
        title: "Select recording",
        properties: ["openFile"],
        defaultPath: require("path").join(__dirname, "../records"),
        buttonLabel: "Edit",
        message: "Select the Recording JSON to Edit",
        filters: [
            { name: "Playback Recording", extensions: ["json"] }
        ]
    });
    if(file && file.filePaths && file.filePaths.length && file.filePaths.length > 0) {
        let filePath = file.filePaths[0];

        const json = JSON.parse(fs.readFileSync(filePath, "utf8"));

        createVirtualWindow(filePath, JSON.stringify(json, null, "\t"), (json) => {

        });
    }
});

waitForButton.click(() => {
    ipcRenderer.send("waitFor", {
        uuid: previewItem,
        replicateInputs
    });
});

recordButton.click(async () => {
    if(!isRecording) {
        ipcRenderer.send("startRecording", {
            uuid: previewItem,
        });
        isRecording = true;
        recordButton.css("opacity", "0.2");
    } else {
        // stop recording
        ipcRenderer.send("stopRecording", {
            uuid: previewItem
        });
        isRecording = false;
        recordButton.css("opacity", "1");
    }
});

ipcRenderer.on("browserReady", (e, data) => {
    readyBrowsers.push(data.uuid);
});

topbar.click(() => {
    // maximize window
    isMaximized = !isMaximized;
    if(isMaximized) {
        remote.getCurrentWindow().maximize();
    } else {
        remote.getCurrentWindow().unmaximize();
    }
});


newTask.click(async () => {
    let url = await prompt({
        title: "Please enter a URL",
        label: "URL",
        value: "https://www.supremenewyork.com",
        inputAttrs: {
            type: "url",
        },
        type: "input"
    });

    if(url) {

        let emulation = await prompt({
            title: "Emulation Mode",
            label: "Select an Emulation Mode",
            type: "select",
            selectOptions: ["iPhone", "None"]
        });

        window.emulation = emulation;
        if(emulation === "0") emulation = "iphone";
        if(emulation === "1") emulation = "none";

        console.log("Emulation: " + emulation);

        let amount = parseFloat(await prompt({
            title: "Amount",
            label: "Amount of Browsers",
            value: "1",
            inputAttrs: {
                type: "number",
            },
            type: "input"
        }));


        if(emulation && amount && amount > 0) {
            for(let i = 0; i < amount; i++) {
                ipcRenderer.send("newTask", {
                    uuid: (Math.round(Math.random() * 1000000)).toString(),
                    url,
                    emulation
                });
            }
        }
    }
});

browserBackButton.click(() => {
    if(previewItem) {
        ipcRenderer.send("browserBack", {
            uuid: previewItem,
            replicateInputs
        });
    }
});

browserForwardButton.click(() => {
    if(previewItem) {
        ipcRenderer.send("browserForward", {
            uuid: previewItem,
            replicateInputs
        });
    }
});

browserDuplicateButton.click(() => {
    if(previewItem) {
        ipcRenderer.send("browserDuplicate", {
            uuid: previewItem,
            replicateInputs
        });
    }
});

browserSearchButton.click(async () => {
    let newURL = await prompt({
        title: "Please enter a URL",
        label: "URL",
        value: "https://www.google.com",
        inputAttrs: {
            type: "url",
        },
        type: "input"
    });

    if(newURL) {
        if(previewItem) {
            ipcRenderer.send("browserSearch", {
                uuid: previewItem,
                url: newURL,
                replicateInputs,
            });
        }
    }
});


let useElements = false;

replicateInputsImage.attr("src", "./images/Switch-1.png");
replicateInputsButton.click(() => {
    replicateInputs = !replicateInputs;
    if(replicateInputs) {
        replicateInputsImage.attr("src", "./images/Switch.png");
    } else {
        replicateInputsImage.attr("src", "./images/Switch-1.png");
    }
});

useElementButton.click(() => {
    useElements = !useElements;
    if(useElements) {
        useElementImage.attr("src", "./images/Switch.png");
    } else {
        useElementImage.attr("src", "./images/Switch-1.png");
    }
})

closeButton.click(() => {
    ipcRenderer.send("cleanup");
    remote.getCurrentWindow().close();
});

let isMaximized = false;
minimizeButton.click(() => {
    remote.getCurrentWindow().minimize();
});

maximizeButton.click(() => {
    isMaximized = !isMaximized;
    if(isMaximized) {
        remote.getCurrentWindow().maximize();
    } else {
        remote.getCurrentWindow().unmaximize();
    }
});


let lastCursorTimeout = -1;
const recentCursorUpdate = () => {
    clearTimeout(lastCursorTimeout);
    lastCursorTimeout = setTimeout(() => {
        $("html").css("cursor", "");
    }, 500);
}

ipcRenderer.on("updateCursor", (e, data) => {
    const cursor = data.cursor;
    $("html").css("cursor", cursor);
    // recentCursorUpdate();
});


let mouseCursorTick = -1;
let lastMouseX, lastMouseY;

previewImage[0].addEventListener("mouseenter", (e) => {
    isMouseEnter = true;
    if(isEditing !== 0) return;
    if(isPromptingVariable) return;
    if(mouseCursorTick !== -1) clearInterval(mouseCursorTick);
    mouseCursorTick = setInterval(() => {
        ipcRenderer.send("browserCursorHover", {
            uuid: previewItem,
            x: lastMouseX,
            y: lastMouseY
        });
    }, 100);
});

previewImage[0].addEventListener("mouseleave", (e) => {
    isMouseEnter = false;
    if(mouseCursorTick !== -1) clearInterval(mouseCursorTick);
    $("html").css("cursor", "");
});

previewImage[0].addEventListener("mousemove", (e) => {
    if(isEditing !== 0) return;
    if(isPromptingVariable) return;
    const bounds = previewImage[0].getBoundingClientRect();
    const x = (e.pageX - bounds.x) / bounds.width;
    const y = (e.pageY - bounds.y) / bounds.height;
    lastMouseX = x; lastMouseY = y;
    ipcRenderer.send("browserCursorHover", {
        uuid: previewItem,
        x, y
    });
});

previewImage[0].addEventListener("mousedown", (e) => {
    if(!isMouseEnter) return;
    if(isEditing !== 0) return;
    if(isPromptingVariable) return;
    $(".popupType").remove();
    if(!previewItem) return;
    const bounds = previewImage[0].getBoundingClientRect();
    const x = (e.pageX - bounds.x) / bounds.width;
    const y = (e.pageY - bounds.y) / bounds.height;
    lastClickXRel = x;
    lastClickYRel = y;
    lastClickX = e.pageX;
    lastClickY = e.pageY;
    ipcRenderer.send("browserMouseDown", {
        uuid: previewItem,
        x,
        y,
        replicateInputs,
        useElements,
        rightClick: e.button === 2,
        middleClick: e.button === 1
    });
    // console.log(`X: ${x} , Y: ${y}`); -
}, true);

previewImage[0].addEventListener("mouseup", (e) => {
    if(!isMouseEnter) return;
    if(isEditing !== 0) return;
    if(isPromptingVariable) return;
    if(!previewItem) return;
    const bounds = previewImage[0].getBoundingClientRect();
    const x = (e.pageX - bounds.x) / bounds.width;
    const y = (e.pageY - bounds.y) / bounds.height;
    ipcRenderer.send("browserMouseUp", {
        uuid: previewItem,
        x,
        y,
        replicateInputs,
        useElements,
        rightClick: e.button === 2
    });
    // console.log(`X: ${x} , Y: ${y}`);
}, true);

let scrollTimeout = -1;
let scrollYChange = 0;

previewImage[0].addEventListener("wheel", (e) => {
    if(!isMouseEnter) return;
    if(isEditing !== 0) return;
    if(isPromptingVariable) return;
    if(!previewItem) return;
    clearSelect();

    ipcRenderer.send("browserWheelChange", {
        uuid: previewItem,
        x: e.deltaX,
        y: e.deltaY,
        replicateInputs
    })

    if(scrollTimeout !== -1) {
        clearTimeout(scrollTimeout);
        scrollYChange = scrollYChange + e.deltaY;
    } else {
        scrollYChange = e.deltaY;
    }

    scrollTimeout = setTimeout(() => {
        if(!replicateInputs) return;
        ipcRenderer.send("browserWheelSync", {
            uuid: previewItem,
            x: e.deltaX,
            y: scrollYChange,
            replicateInputs
        });
        scrollTimeout = -1;
    }, 500);
    // console.log(`X: ${x} , Y: ${y}`);
}, true);

window.addEventListener("keydown", (e) => {
    if(!isMouseEnter) return;
    if(isEditing !== 0) return;
    if(isPromptingVariable) return;
    if(!previewItem) return;
    ipcRenderer.send("browserKeyDown", {
        uuid: previewItem,
        key: e.key,
        replicateInputs,
        useElements
    });
}, true);

window.addEventListener("keyup", (e) => {
    if(!isMouseEnter) return;
    if(isEditing !== 0) return;
    if(isPromptingVariable) return;
    if(!previewItem) return;
    ipcRenderer.send("browserKeyUp", {
        uuid: previewItem,
        key: e.key,
        replicateInputs,
        useElements
    });
}, true);


//#region CREATION OF PREVIEWS
$("#queue").hide();

ipcRenderer.on("queueUpdate", (e, data) => {
    if(data.uuid === previewItem) {
        $("#queueText").text(data.queue);
    }
});

const varsSheets = new Map();
const setVars = (uuid, path, data) => {
    updateTaskName(uuid, data.name);
    varsSheets.set(uuid, { path, data });
}

ipcRenderer.on("variable", (e, data) => {
    if(varsSheets.has(data.uuid)) {
        const value = varsSheets.get(data.uuid).data.vars[data.variable];
        ipcRenderer.send("variableResponse", {
            value
        });
    } else {
        // MAKE ERROR IN UI, STOP EXECUTION
    }
});

ipcRenderer.on("promptVariable", () => {
    promptVariable().then(v => ipcRenderer.send("variableSelected", v));
});

const changePreview = (uuid) => {
    // if(uuid === false) {
    //     noTasksPreview.show();
    //     clearSelect();
    //     if(previewItem) {
    //         ipcRenderer.send("stopPreview", {
    //             uuid: previewItem
    //         });
    //     }
    //     $("#queue").hide();
    //     previewElement.css("display", "none");
    //     previewItem = false;
    //     return;
    // }
    noTasksPreview.hide();
    clearSelect();
    if(previewItem) {
        // if(previewItem !== uuid) {
        //     console.log("Stopping preview of: " + previewItem);
        //     ipcRenderer.send("stopPreview", {
        //         uuid: previewItem
        //     });
        // }
        $(`#${previewItem} .preview`).css("box-shadow", `unset`);
    }
    // if(previewItem !== uuid) {
    //     console.log("Starting preview of: " + uuid);
    //     ipcRenderer.send("startPreview", {
    //         uuid
    //     });
    // }
    previewItem = uuid;
    // el("previewImage").attr("src", "./images/browser_preview.png");
    updatePreview();
    $("#queue").show();
    previewElement.css("display", "flex");
    console.log("Selected to preview task: " + previewItem);
}

const addTask = (data) => {
    noTasksPreview.hide();
    const element = $(`<div class="task" id="${data.uuid}"> <div class="preview"> <img src="./images/preview_disabled.png"> </div> <div style="padding-bottom: 30px;"><h1 class="varsname" style="float: left; text-align: left;">no vars</h1><h1 class="cleanup" style="color: red; float: right; font-size: 15px; font-weight: 800; padding-right: 2px;">X</h1><h1 class="savevars" style="color: #2e2ede; float: right; font-size: 15px; font-weight: 800; padding-right: 2px; margin-right: 5px;">?</h1></div> </div>`).appendTo(tasksList);
    
    let hasVars = false;


    element.find(".varsname").click(() => {
        let obj = varsSheets.get(data.uuid);
        if(obj) {
            createVirtualWindow(obj.path, JSON.stringify(obj.data, null, "\t"), (json) => {
                obj.data = json;
                varsSheets.set(data.uuid, obj); 
            });
        }
    });
    element.find(".savevars").click(async () => {
        if(hasVars) {
            // find open from location
        } else {
            // find save location
            const file = await dialog.showSaveDialog({
                title: "Variable sheet",
                defaultPath: require("path").join(__dirname, "records"),
                buttonLabel: "Assign to Browser",
                properties: ["createDirectory", "showOverwriteConfirmation"],
                message: "Select where to save a new variable sheet or an existing one to assign",
                filters: [
                    { name: "Variable sheet", extensions: ["json"] }
                ]
            });
            const filePath = file.filePath;
            if(fs.existsSync(filePath)) {
                const str = fs.readFileSync(filePath, "utf8");
                const obj = JSON.parse(str);
                console.log(obj);
                setVars(data.uuid, filePath, obj);
            } else {
                const obj = {
                    "name": "varsheet1",
                    "vars": {
                        "profileName": "Example"
                    }
                };
                fs.writeFileSync(filePath, JSON.stringify(obj));
                setVars(data.uuid, filePath, obj);
            }
        }
    });
    element.find(".cleanup").click(() => {
        ipcRenderer.send("cleanupInstance", { uuid: data.uuid });
        if(previewItem === data.uuid) {
            changePreview(false);
        }
        element.remove();
    });
    element.find("img").css("display", "none");
    element.css("display", "block"); // css override
    element.find("img").click((e) => {
        if(readyBrowsers.includes(data.uuid)) {
            if(isRecording) {
                dialog.showErrorBox("Error", "Error: Recording in progress, stop recording before continuing");
                return;
            }
            if(isPlayback) {
                dialog.showErrorBox("Error", "Error: Playback in progress, stop playback before continuing");
                return;
            }

            let uuid = $(e.delegateTarget).parent(".preview").parent(".task").attr("id");

            changePreview(uuid);
        }
    });
}

const updateTaskName = (uuid, name) => {
    $($(`#${uuid} h1`)[0]).text(name);
}

const clearSelect = () => {
    $("select").remove();
}

ipcRenderer.on("rippleEffect", (e, data) => {
    if(data.uuid !== previewItem) return;
    boxRipple(data.width, data.height, data.x, data.y);
});

ipcRenderer.on("clearPopups", (e, uuid) => {
    if(uuid === previewItem) {
        clearSelect();
        $(".popupType").remove();
    }
});

ipcRenderer.on("spawnSelect", (e, data) => {
    if(data.uuid === previewItem) {
        clearSelect();

        const options = data.options;
        //type, value

        const preview = previewImage[0].getBoundingClientRect();
        const rect = data.rect;
        const left = (rect.left / data.pageWidth) * preview.width;
        const top = (rect.top / data.pageHeight) * preview.height;

        let optionsString = "";
        for(let i = 0; i < options.length; i++) {
            let option = options[i];
            optionsString = optionsString + `<option value="${option.value}">${option.text}</option>`
        }

        let width = (rect.width / data.pageWidth) * preview.width;
        let height = ((rect.height / data.pageHeight) * preview.height) * options.length;
        const selectPopup = $(`<select id="selectPopup" style="overflow: hidden; border: 1px solid #7d7d7d; border-radius: 2px; pointer-events: all; z-index: 500; position: absolute; left: ${left + preview.left}px; top: ${top + preview.top}px; width: ${width}px; height: ${height}px; font-size: 80%; font-weight: 600;">${optionsString}</select>`);
        selectPopup.appendTo($("body"));
        selectPopup[0].size = options.length;
        selectPopup.change((e) => {
            const value = selectPopup.val();
            ipcRenderer.send("browserSelectChange", {
                value,
                selector: data.selector,
                replicateInputs,
                uuid: previewItem
            });
            clearSelect();
        });
    }
});

ipcRenderer.on("taskCreated", (e, data) => {
    console.log("ADDING TASK: " + data.uuid);
    addTask(data);
});


ipcRenderer.on("updateTaskName", (e, data) => {
    // updateTaskName(data.uuid, data.name);
});

ipcRenderer.on("taskDestroyed", (e, uuid) => {
    $(`#${uuid}`).remove();
    // if(tasksList.children().length === 1) el("noPreviewList").show();
});

ipcRenderer.on("taskPaused", (e, uuid) => {
    updateTaskName(uuid, "no vars");
    $(`#${uuid} .preview img`).attr("src", "./images/preview_disabled.png");
});

const { getAverageColor } = require("fast-average-color-node");
const { ipcMain } = require("electron");
const { ifError } = require("assert");

ipcRenderer.on("hasPreview", async (e, data) => {
    const uuid = data.uuid;
    const base64 = data.base64;

    const averageColor = await getAverageColor(base64);


    if(uuid === previewItem) {
        $(`#${uuid} .preview`).css("box-shadow", `0px 0px 10px 0px ${averageColor.rgb}`);
        previewImage.attr("src", base64);
    }


    $(`#${uuid} .preview img`).css("display", "block");
    $(`#${uuid} .preview img`).attr("src", base64);
});

ipcRenderer.send("initialized");

const devTask = () => {
    let uuid = (Math.round(Math.random() * 1000000)).toString();
    ipcRenderer.send("newTask", {
        uuid,
        url: "https://www.supremenewyork.com",
        emulation: "None",
    });
    // once page is ready
    
    ipcRenderer.once("browserReady", (e, data) => {
        console.log("Swapping PREVIEWS");
        changePreview(uuid);

        ipcRenderer.send("startPlayback", {
            uuid,
            replicateInputs: false,
            path: "./records/supremeDesktopHanes.json"
        });
    });
}

// devTask();

//#endregion
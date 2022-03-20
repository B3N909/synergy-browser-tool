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



amdRequire.config({
    baseUrl: ( (_path) => {
        let pathName = path.resolve(_path).replace(/\\/g, '/');
        if (pathName.length > 0 && pathName.charAt(0) !== '/') {
            pathName = '/' + pathName;
        }
        return encodeURI('file://' + pathName);
    }) (path.join(__dirname, 'monaco-editor/min'))
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


const createVirtualWindow = (filePath, fileName, json) => {
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
    virtualWindow.fadeIn(200);
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


    virtualWindow.find(".circle").click(() => virtualWindow.fadeOut(200, () => virtualWindow.remove()));
    createMonacoEditor(virtualWindow.find(".virtualbody")[0], json, (e, editor) => {
        const stringValue = editor.getValue().toString().replaceAll("\n", "").replaceAll("\t", "");
        try {
            const jsonValue = JSON.parse(stringValue);
            fs.writeFileSync(filePath, JSON.stringify(jsonValue), "utf8");
            console.log("Saved content!");
        } catch (err) {}
    });
};


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

tippy($(".circle-icon-button")[0], { content: "Go back" });
tippy($(".circle-icon-button")[1], { content: "Go forward" });
tippy($(".circle-icon-button")[2], { content: "Wait for 1s" });
tippy($(".circle-icon-button")[3], { content: "Playback recording" });
tippy($(".circle-icon-button")[4], { content: "Start recording" });
tippy($(".circle-icon-button")[5], { content: "Edit recording" });
tippy($(".circle-icon-button")[6], { content: "Duplicate browser" });
tippy($(".circle-icon-button")[7], { content: "Change URL" });
tippy($(".newtask")[0], { content: "Create a new browser" });




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


// TODO: BEFORE BETA RELEASE
// TODO:
// TODO: Change SELECT
// TODO: -> Change Select so that on recording, it skips the last click event and swaps for select event
// TODO: -> Change Select so that it works with clickElement



// TODO: ADD REQUEST LIBRARY !? !?
// TODO: ADD JS LIBRARY      !? !?
// TODO:
// TODO: Remove wait after relative click in place for waitForElement of element at that position?



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


ipcRenderer.on("promptEventType", () => {
    popupType();
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

const popupType = () => {
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
    e.children("button").click((a, b, c) => {
        const val = $(a.target).text();
        ipcRenderer.send("eventTypeSelected", {
            type: val,
        });
        e.fadeOut(125, () => e.remove());
    });
}


let isRecording = false;
let isPlayback = false;
let isStoppingPlayback = false;

playbackButton.click(() => {
    if(isStoppingPlayback) {
        return;
    }

    if(!isRecording && !isPlayback) {
        isPlayback = true;
        playbackButton.css("opacity", "0.2");
        ipcRenderer.send("startPlayback", {
            uuid: previewItem,
            replicateInputs
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

        createVirtualWindow(filePath, filePath.replace(/^.*[\\\/]/, ''), JSON.stringify(json, null, "\t"));
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
        ipcRenderer.send("newTask", {
            uuid: (Math.round(Math.random() * 1000000)).toString(),
            url
        });
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
    if(mouseCursorTick !== -1) clearInterval(mouseCursorTick);
    $("html").css("cursor", "");
});

previewImage[0].addEventListener("mousemove", (e) => {
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
        rightClick: e.button === 2
    });
    // console.log(`X: ${x} , Y: ${y}`); -
}, true);

previewImage[0].addEventListener("mouseup", (e) => {
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

previewImage[0].addEventListener("wheel", (e) => {
    if(!previewItem) return;
    clearSelect();
    ipcRenderer.send("browserWheelChange", {
        uuid: previewItem,
        x: e.deltaX,
        y: e.deltaY,
        scrollX: window.scrollX,
        scrollY: window.scrollY,
        replicateInputs
    });
    // console.log(`X: ${x} , Y: ${y}`);
}, true);

window.addEventListener("keydown", (e) => {
    if(!previewItem) return;
    ipcRenderer.send("browserKeyDown", {
        uuid: previewItem,
        key: e.key,
        replicateInputs,
        useElements
    });
}, true);

window.addEventListener("keyup", (e) => {
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
    } else {
        console.log(data);
    }
});

const addTask = (data) => {
    noTasksPreview.hide();
    const element = $(`<div class="task" id="${data.uuid}"> <div class="preview"> <img src="./images/preview_disabled.png"> </div> <div><h1 style="float: left;">Loading</h1><h1 class="cleanup" style="color: red; float: right; font-size: 15px; font-weight: 800; padding-right: 2px;">X</h1></div> </div>`).appendTo(tasksList);
    element.find(".cleanup").click(() => {
        ipcRenderer.send("cleanupInstance", { uuid: data.uuid });
        element.remove();
    });
    element.find("img").css("display", "none");
    element.css("display", "block"); // css override
    element.click((e) => {
        if(readyBrowsers.includes(data.uuid)) {
            if(isRecording) {
                dialog.showErrorBox("Error", "Error: Recording in progress, stop recording before continuing");
                return;
            }
            if(isPlayback) {
                dialog.showErrorBox("Error", "Error: Playback in progress, stop playback before continuing");
                return;
            }


            noTasksPreview.hide();
            clearSelect();
            previewItem = $(e.delegateTarget).attr("id");
            // el("previewImage").attr("src", "./images/browser_preview.png");
            updatePreview();
            $("#queue").show();
            previewElement.css("display", "flex");
            console.log("Selected to preview task: " + previewItem);
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

        const selectPopup = $(`<select style="border: 1px solid black; border-radius: 10px; pointer-events: all; z-index: 500; position: absolute; left: ${left + preview.left}px; top: ${top + preview.top}px; width: ${rect.width}px; height: ${rect.height}px;">${optionsString}</select>`);
        selectPopup.appendTo($("body"));
        selectPopup.change((e) => {
            const value = selectPopup.attr("value");
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
    updateTaskName(data.uuid, data.name);
});

ipcRenderer.on("taskDestroyed", (e, uuid) => {
    $(`#${uuid}`).remove();
    // if(tasksList.children().length === 1) el("noPreviewList").show();
});

ipcRenderer.on("taskPaused", (e, uuid) => {
    updateTaskName(uuid, "Starting");
    $(`#${uuid} .preview img`).attr("src", "./images/preview_disabled.png");
});

const { getAverageColor } = require("fast-average-color-node");
const { ipcMain } = require("electron");
const { ifError } = require("assert");

ipcRenderer.on("hasPreview", async (e, data) => {
    const uuid = data.uuid;
    const base64 = data.base64;

    if(uuid === previewItem) {
        previewImage.attr("src", base64);
    }

    const averageColor = await getAverageColor(base64);

    $(`#${uuid} .preview img`).css("display", "block");
    $(`#${uuid} .preview img`).attr("src", base64);
    $(`#${uuid} .preview`).css("box-shadow", `0px 0px 0px 3px ${averageColor.rgb}`);
});

ipcRenderer.send("initialized");

//#endregion
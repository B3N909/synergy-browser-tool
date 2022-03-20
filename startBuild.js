const PageWrapper = require("./PageWrapper.js");

const express = require("express");
const path = require("path");
const expressApp = express();


expressApp.use(express.static(path.join(__dirname, "views")));
expressApp.use("/", (req, res) => {
    res.sendFile(`${__dirname}/views/index.html`);
});

expressApp.listen(3030, () => {
    console.log("Local server started!");
});



const {
    ipcMain,
    protocol,
    session,
    dialog,
    app,
    BrowserWindow
} = require("electron");

const chromePaths = require("chrome-paths");
if(!chromePaths.chrome || !require("fs").existsSync(chromePaths.chrome)) {
    dialog.showErrorBox("Chrome Not Found", "Please install chrome, if chrome is installed please report this in the Discord!");
    process.exit(-1);
}


const createWindow = () => {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        frame: false,
        transparent: true,
        resizable: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            enableRemoteModule: true,
            nativeWindowOpen: true,
        },
        show: false
    });

    // win.maximize();

    global.browserToolWindow = win;

    global.browserToolWindow.show();
    global.browserToolWindow.loadURL(`http://localhost:3030/`);
    // global.browserToolWindow.openDevTools({ mode: "detach"});
}

const appReady = async () => {
    console.log("Creating main window");
    createWindow();
}

app.whenReady().then(() => {
    appReady();
});

class BrowserManager {

    constructor(BrowserInstance) {
        this.BrowserInstance = BrowserInstance;

        this.browsers = new Map();


        // Replicate Inputs:
        // Create a wrapper queue for any interaction
        // -> Wait for any currently happening page load to finish

        ipcMain.on("newTask", (e, data) => {
            this.createBrowserInstance(data.uuid, data.url);
            global.browserToolWindow.webContents.send("taskCreated", { uuid: data.uuid });
        });

        ipcMain.on("browserForward", (e, data) => {
            if(data.replicateInputs) {
                for (const [key, value] of this.browsers.entries()) {
                    value.forward();
                }
            } else {
                this.browsers.get(data.uuid).forward();
            }
        });

        ipcMain.on("browserBack", (e, data) => {
            if(data.replicateInputs) {
                for (const [key, value] of this.browsers.entries()) {
                    value.back();
                }
            } else {
                this.browsers.get(data.uuid).back();
            }
        });

        ipcMain.on("browserKeyUp", (e, data) => {
            if(data.replicateInputs) {
                for (const [key, value] of this.browsers.entries()) {
                    value.key(data.key, "keyup");
                }
            } else {
                this.browsers.get(data.uuid).key(data.key, "keyup", data.useElements);
            }
        });

        ipcMain.on("browserKeyDown", (e, data) => {
            if(data.replicateInputs) {
                for (const [key, value] of this.browsers.entries()) {
                    value.key(data.key, "keydown");
                }
            } else {
                this.browsers.get(data.uuid).key(data.key, "keydown", data.useElements);
            }
        });

        ipcMain.on("grabPreview", (e, uuid) => {
            if(this.browsers.has(uuid)) {
                const browser = this.browsers.get(uuid);
                browser.screenshot().then(base64 => {
                    // console.log("Base64: " + base64);
                    global.browserToolWindow.webContents.send("hasPreview", {
                        uuid,
                        base64: `data:image/png;base64, ${base64}`
                    });
                })
            }
        });

        ipcMain.on("browserWheelChange", async (e, data) => {
            if(data.replicateInputs) {
                for (const [key, value] of this.browsers.entries()) {
                    await value.scroll(data.x, data.y, data.scrollX, data.scrollY);
                }
            } else {
                this.browsers.get(data.uuid).scroll(data.x, data.y, data.scrollX, data.scrollY);
            }
        });

        ipcMain.on("browserMouseDown", async (e, data) => {
            if(data.replicateInputs) {
                for (const [key, value] of this.browsers.entries()) {
                    await value.click(data.x, data.y, "mousedown", data.useElements, data.rightClick);
                }
            } else {
                this.browsers.get(data.uuid).click(data.x, data.y, "mousedown", data.useElements, data.rightClick);
            }
        });

        ipcMain.on("browserMouseUp", async (e, data) => {
            if(data.replicateInputs) {
                for (const [key, value] of this.browsers.entries()) {
                    value.click(data.x, data.y, "mouseup", data.useElements);
                }
            } else {
                this.browsers.get(data.uuid).click(data.x, data.y, "mouseup", data.useElements);
            }
        });

        ipcMain.on("browserSelectChange", (e, data) => {
            if(data.replicateInputs) {
                 for (const [key, value] of this.browsers.entries()) {
                    value.select(data.selector, data.value);
                }
            } else {
                this.browsers.get(data.uuid).select(data.selector, data.value);
            }
        });

        ipcMain.on("browserCursorHover", async (e, data) => {
            // console.log("X: " + data.x + " Y: " + data.y);
            let cursor = await this.browsers.get(data.uuid).getCursor(data.x, data.y);
            global.browserToolWindow.webContents.send("updateCursor", { cursor });
        });

        ipcMain.on("browserSearch", (e, data) => {
            const url = data.url;
            if(data.replicateInputs) {
                for (const [key, value] of this.browsers.entries()) {
                   value.goto(url);
               }
           } else {
               this.browsers.get(data.uuid).goto(url);
           }
        });

        ipcMain.on("startRecording", (e, data) => {
            this.browsers.get(data.uuid).startRecording();
        });

        ipcMain.on("stopRecording", async (e, data) => {
            const file = await dialog.showSaveDialog({
                title: "Recording JSON to Play",
                defaultPath: require("path").join(__dirname, "records"),
                buttonLabel: "Save Recording",
                properties: ["createDirectory"],
                message: "Select where to save the recording to",
                filters: [
                    { name: "Playback Recording", extensions: ["json"] }
                ]
            });
            const filePath = file.filePath;
            this.browsers.get(data.uuid).stopRecording(filePath);
        });

        ipcMain.on("startPlayback", async (e, data) => {
            const file = await dialog.showOpenDialog({
                title: "Recording JSON to Play",
                defaultPath: require("path").join(__dirname, "records"),
                buttonLabel: "Play",
                properties: ["openFile"],
                message: "Select the Recording JSON to Playback",
                filters: [
                    { name: "Playback Recording", extensions: ["json"] }
                ]
            });
            if(file) {
                if(!file.canceled) {
                    if(file.filePaths && file.filePaths.length == 1) {
                        const filePath = file.filePaths[0];

                        if(data.replicateInputs) {
                            let promises = [];
                            for (const [key, value] of this.browsers.entries()) {
                                promises.push(value.playback(filePath));
                            }
                            Promise.all(promises).then(() => global.browserToolWindow.webContents.send("playbackComplete"));
                        } else {
                            this.browsers.get(data.uuid).playback(filePath).then(() => global.browserToolWindow.webContents.send("playbackComplete"));
                        }
                    } 
                }
            }
        });

        ipcMain.on("cleanupInstance", (e, data) => {
            this.browsers.get(data.uuid).cleanup();
            this.browsers.delete(data.uuid);
        });

        ipcMain.on("waitFor", (e, data) => {
            if(data.replicateInputs) {
                for (const [key, value] of this.browsers.entries()) {
                    value.wait(1000);
                }
            } else {
                this.browsers.get(data.uuid).wait(1000);
            }
        });

        ipcMain.on("stopPlayback", (e, data) => {
            if(data.replicateInputs) {
                for (const [key, value] of this.browsers.entries()) {
                    value.stopPlayback();
                }
            } else {
                this.browsers.get(data.uuid).stopPlayback();
            }
        });

        
    }



    async duplicate (uuid) {
        let browser = this.browsers.get(uuid);
        let newUUID = Math.round((Math.random() * 100000)).toString();
        this.createBrowserInstance(newUUID, browser.url());
        global.browserToolWindow.webContents.send("taskCreated", { uuid: newUUID });
    }

    async createBrowserInstance (uuid, siteURL, proxy) {
        const browser = new this.BrowserInstance(uuid, siteURL, proxy);

        await browser.launch();

        this.browsers.set(uuid, browser);
    }

    async destroyAll () {
        for (const [key, value] of this.browsers.entries()) {
            await value.cleanup();
        }
    }

    async destroyBrowserInstance (uuid) {
        if(this.browsers.has(uuid)) {
            await this.browsers.get(uuid).cleanup();
            this.browsers.delete(uuid);
        }
    }
}
class BrowserInstance {
    constructor(uuid, targetURL, proxy) {
        this.ready = false;
        this.disableNextMouseUp = false;


        this.taskID = uuid;
        this.siteURL = targetURL;
        this.proxy = proxy;

        const stealth = require("puppeteer-extra-plugin-stealth")();
        // const UserAgentOverride = require('puppeteer-extra-plugin-stealth/evasions/user-agent-override')
        stealth.enabledEvasions.delete('chrome.app');
        stealth.enabledEvasions.delete('chrome.csi');
        stealth.enabledEvasions.delete('chrome.loadTimes');
        stealth.enabledEvasions.delete('chrome.runtime');
        stealth.enabledEvasions.delete('iframe.contentWindow');
        stealth.enabledEvasions.delete('media.codecs');
        stealth.enabledEvasions.delete('navigator.hardwareConcurrency');
        stealth.enabledEvasions.delete('navigator.languages');
        stealth.enabledEvasions.delete('navigator.plugins');
        stealth.enabledEvasions.delete('navigator.vendor');
        stealth.enabledEvasions.delete('user-agent-override');
        stealth.enabledEvasions.delete('webgl.vendor');
        this.pup = require("puppeteer-extra").use(stealth);
        this.userAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 14_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.1 Mobile/15E148 Safari/604.1";
        this.chromePaths = require("chrome-paths");

        this.ready = false;

        this.queueReady = true;

        this.colors = require("colors");
        this._oldLog = console.log;
        console.log = (msg) => {
            this._oldLog(`[${this.taskID}]`.cyan + " " + msg);
        }

        setInterval(() => {
            if(this.queue) {
                global.browserToolWindow.webContents.send("queueUpdate", {
                    uuid: this.taskID.toString(),
                    queue: this.queue.length
                });
            }
        }, 50);

        process.on("uncaughtException", (err) => {
            this.handleError();
            console.log("FATAL ERROR: ".bgRed);
            console.log(err);
        });
        process.on("unhandledRejection", (err) => {
            this.handleError();
            console.log("FATAL ERROR: ".bgRed);
            console.log(err);
        });
        
    }

    async launch () {
        let options = {
            // executablePath: this.pup.executablePath().replace('app.asar', 'app.asar.unpacked'),
            executablePath: this.chromePaths.chrome,
            headless: true,
            devtools: false,
            args:  [
                '--autoplay-policy=user-gesture-required',
                '--disable-background-networking',
                '--disable-background-timer-throttling',
                '--disable-backgrounding-occluded-windows',
                '--disable-breakpad',
                '--disable-client-side-phishing-detection',
                '--disable-component-update',
                '--disable-default-apps',
                '--disable-dev-shm-usage',
                '--disable-domain-reliability',
                '--disable-extensions',
                '--disable-features=AudioServiceOutOfProcess',
                '--disable-hang-monitor',
                '--disable-ipc-flooding-protection',
                '--disable-notifications',
                '--disable-offer-store-unmasked-wallet-cards',
                '--disable-popup-blocking',
                '--disable-print-preview',
                '--disable-prompt-on-repost',
                '--disable-renderer-backgrounding',
                '--disable-setuid-sandbox',
                '--disable-speech-api',
                '--disable-sync',
                '--hide-scrollbars',
                '--ignore-gpu-blacklist',
                '--metrics-recording-only',
                '--mute-audio',
                '--no-default-browser-check',
                '--no-first-run',
                '--no-pings',
                '--no-sandbox',
                '--no-zygote',
                '--password-store=basic',
                '--use-gl=swiftshader',
                '--use-mock-keychain',
                '--user-agent=Mozilla/5.0 (iPhone; CPU iPhone OS 14_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.1 Mobile/15E148 Safari/604.1', '--no-sandbox', '--disable-infobars']
        };

        if(this.proxy) options.args.push('--proxy-server=' + this.proxy.address + ":" + this.proxy.port);

        // options["executablePath"] = global.customChromeLocation;
        // let chromeArgKey = global.argToken;
        // console.log(chromeArgKey);
        // options["args"].push('--apples_and_oranges=' + chromeArgKey);

        this.browser = await this.pup.launch(options);
        this.page = await this.browser.newPage();
        this._page = new PageWrapper(this.page);

        await this._page.newDocument();

        

        if(this.proxy && typeof this.proxy.username) {
            await this.page.authenticate({
                username: this.proxy.username,
                password: this.proxy.password
            });
        }


        const client = await this.page.target().createCDPSession();
        await client.send("Animation.enable");
        await client.send("Animation.setPlaybackRate", {
            playbackRate: 999999
        });

        await this.page.on("load", () => {
            console.log(`Page loaded`.grey);
            global.browserToolWindow.webContents.send("clearPopups", this.taskID);
        });

        await this.page.setViewport({width: 375 , height: 812, deviceScaleFactor: 1, isMobile: true, hasTouch: true});
        this.width = 375;
        this.height = 812;


        await this.page.goto(this.siteURL);

        setInterval(async () => {
            // const base64 = await this.screenshot();
            // global.browserToolWindow.webContents.send("hasPreview", {
            //     uuid: this.taskID,
            //     base64: `data:image/png;base64, ${base64}`
            // });
            try {
                const title = await this._page.title();
                global.browserToolWindow.webContents.send("updateTaskName", {
                    uuid: this.taskID,
                    name: title
                })
            } catch (err) {}
        }, 500);

        const target = this.page.target();
        this.session = await target.createCDPSession();
        await this.session.send("Page.enable");

        await this.session.on("Page.screencastFrame", (data) => {
            this.base64 = data.data;
            global.browserToolWindow.webContents.send("hasPreview", {
                uuid: this.taskID,
                base64: `data:image/png;base64, ${this.base64}`
            });
            this.session.send("Page.screencastFrameAck", {
                sessionId: data.sessionId
            });
        });

        await this.session.send("Page.startScreencast", {
            format: "jpeg",
            quality: 100,
            everyNthFrame: 1,
        });

        await this.page.mouse.move(0, 0);


        global.browserToolWindow.webContents.send("browserReady", {
            uuid: this.taskID,
        });
        this.ready = true;
        this.fakeQueue = [];

        this.addClickWait = true;
        this.clickWait = 200;
    }

    async goto (url) {
        await this._goto({url});
    }
    async _goto (q) {
        await this._queue("goto", q);
        console.log(`Going to `.gray + q.url.blue);
        await this.page.goto(q.url);
        await this._waitFor();
    }

    async wait (ms) {
        await this._wait({ms});
    }
    async _wait (q) {
        await this._queue("wait", q);
        await this.page.waitForTimeout(q.ms);
        await this._waitFor();
    }

    // TODO: Remove cursor lock on scroll

    async getCursor (x, y) {
        if(!this.queueReady) return "wait";

        x = x * this.width;
        y = y * this.height;
        // console.log("X: " + x + " Y: " + y);
        try {
            return await this._page.getCursor(x, y);
        } catch (err) {
            return "wait";
        }
    
    }

    url () {
        return this.page.url();
    }

    handleError () {
        this.stopPlayback();

        if(!this.didError) {
            global.browserToolWindow.webContents.send("showError", {
                url: this.url(),
            });
        }

        this.didError = true;
        setTimeout(() => {
            this.didError = false;
        }, 250);
    }

    _queue (type, data) {
        if(typeof this.queue === "undefined") this.queue = [];

        return new Promise(resolve => {
            let b = type === "key";

            const fakeResolve = () => {

                // let doSkip = false;

                // // populate fake queue
                // if(type === "keyelement") {

                //     doSkip = true;

                    
                //     // if((this.lastKeySelector && this.lastKeySelector !== data.selector) || data.key === "Tab") {
                //     //     // different input,
                //     //     if(this.lastInputValue) {
                //     //         this.fakeQueue.push({
                //     //             type: "keyelementarray",
                //     //             text: this.lastInputValue,
                //     //             selector: this.lastKeySelector
                //     //         });
                //     //         this.lastInputValue = "";
                //     //     }
                //     // }
                //     // doSkip = true;
                //     // this.lastKeySelector = data.selector;
                // }
                // } else if(this.lastInputValue) {
                //     this.fakeQueue.push({
                //         type: "keyelementarray",
                //         text: this.lastInputValue,
                //         selector: this.lastKeySelector
                //     });
                //     this.lastInputValue = "";
                // }

                // if we are not skipping, and there is a word append it first

                // if(!doSkip) {
                //     this.fakeQueue.push({
                //         type,
                //         ...data
                //     });
                // }

                this.fakeQueue.push({
                    type,
                    ...data
                });

                // add wait after click while recording
                if(this.recording && type === "click" && this.addClickWait) {
                    this.fakeQueue.push({
                        type: "wait",
                        ms: this.clickWait
                    });
                }
                let change = 0;
                if(this.lastTime) change = Date.now() - this.lastTime;
                this.lastTime = Date.now();
                console.log(`[${change}ms] `.white + "Processing ".gray + type.cyan + " with ".gray + (data ? JSON.stringify(data).white : "{ }".white) + " - left in queue: ".gray + this.queue.length.toString().cyan);
                resolve(); // allow command to execute
            }

            if(this.queueReady) {
                this.queueReady = false; // disable queue, we are using this one
                fakeResolve();
            } else {
                this.queue.push({ /*b,*/ resolve: fakeResolve });
            }
        });
    }

    // might be b: true-with _waitFor or no b: true but without waitFor,
    // if no _waitFor, it stops?


    _waitFor () {
        return new Promise(r => {
            setTimeout(async () => {
                const pageCaughtUp = () => {
                    let q = this.queue.shift();
                    if(q) {
                        // console.log(q);
                        // if(!q.b) this.queueReady = false;

                        q.resolve(); // execute next command in queue
                    } else {
                        this.queueReady = true; // nothing left in queue, we can use it again
                    }
                }

                let i = 0;
                let interval = setInterval(async () => {
                    try {
                        await this._page.tryEvaluate();
                        clearInterval(interval);
                        pageCaughtUp();
                        r();
                    } catch (err) { 
                        if(i % 2 === 0) console.log(`${this.taskID} ...waiting for page to catch up`.bgRed);
                        i++;
                    }
                }, 20);

                // try {
                //     await this.page.evaluate(() => { return location.href });
                //     this.queueReady = true;
                //     r();
                //     ready();
                // } catch (err) {
                //     await this.page.waitForNetworkIdle({
                //         timeout: 10000,
                //     });
                //     this.queueReady = true;
                //     r();
                //     ready();
                // }
            }, 0);
        });
    }

    async forward () {
        await this._queue("forward");
        await this.page.goForward();
        await this._waitFor();
    }

    async back () {
        await this._queue("back");
        await this.page.goBack();
        await this._waitFor();
    }

    // get x, y position from element
    async _getPosition (elementHandle) {
        return await this._page.getPosition(elementHandle);
    }

    async elementFromSelector (selector) {
        if(selector.includes(":")) {
            let splits = selector.split(":");
            const type = splits[0];
            let value = splits.splice(1, splits.length).join(":");
            let index = -1;
            if(value.includes("!")) {
                index = parseInt(value.split("!")[1]);
                value = value.replace("!" + index, "");
            }

            // TODO: Figure out how to best incorporate absolute elements
            // get JSHandle of DOM element from selector
            // -> use for waitForElement
            // -> use for click
            // -> -> use element x, y
            // -> use for key?            

            if(type === "path") {
                // get JSHandle of DOM element
                await this.page.waitForSelector(value, {
                    visible: true
                });

                if(index === -1) {
                    const elementHandle = await this.page.$(value);
                    if(!elementHandle) return false;
                    return elementHandle;
                } else {
                    const elementsHandle = await this.page.$$(value);
                    if(!elementsHandle) return false;
                    return elementsHandle[index];
                }
            } else if(type === "text") {
                // get JSHandle of DOM element
                return await this._page.getElementByText(value);
            } else if(type === "keywords") {
                let keywords = value.split(",");
                
                return await this._page.getElementByKeywords(keywords);
            }
        } else {
            console.log(`Invalid selector: ${selector}`.red);
        }
    }

    async selector (x, y, doPrompt) {
        let type = "none";
        if(x && y) {
            x = x * this.width;
            y = y * this.height;

            // console.log("X: " + x + " Y: " + y);

            if(doPrompt) {
                // Prompt
                global.browserToolWindow.webContents.send("promptEventType", {

                });

                type = await new Promise(r => {
                    ipcMain.once("eventTypeSelected", (e, data) => {
                        r(data.type);
                    });
                });
                console.log(`Event type selected: `.gray + type.toString().cyan);
            } else {
                type = "Full Path";
                console.log(`Event type defaulted: `.gray + type.toString().cyan);
            }
        
        }

        // console.log("Fetch element at " + x + " " + y);
        // await this._queue("_element", {x, y});
        return await this._page.selector(x, y, type);

    }

    async waitForSelector (selector) {
        await this.page.waitForSelector(selector);
    }

    // this needs to be [key, mode, element] since the arguments are directly serialized
    async keyElement (mode, key, selector) {
        await this._keyElement({ mode, key, selector });
    }
    async _keyElement (q) {
        await this._queue("keyelement", q);
        // await this.waitForSelector(q.selector);
        const element = await this.elementFromSelector(q.selector);
        await element.press(q.key);
        const value = await this._page.toInput(element);
        this.lastInputValue = value;
        // const properties = await element.getProperties();
        // console.log(JSON.stringify(properties));
        // await this.page.keyboard.press(q.key);
        await this._waitFor();
    }
    async key (key, mode, absolute) {
        if(absolute) {
            if(mode === "keyup") return;
            const selector = await this.selector();
            await this._keyElement({ mode, key, selector });
        } else {
            await this._key({key, mode}); 
        }
    }
    async _key (q) {
        await this._queue("key", q);
        if(q.mode === "keydown") {
            await this.page.keyboard.down(q.key);
        } else if(q.mode === "keyup") {
            await this.page.keyboard.up(q.key);
        }
        await this._waitFor();
    }

    async select (selector, value) {
        await this._select({selector, value});
    }
    async _select (q) {
        await this._queue("select", q);
        await this.page.select(q.selector, q.value);
        await this._waitFor();
    }


    async clickElement(selector) {
        await this._clickElement({ selector });
    }
    async _clickElement (q) {
        await this._queue("clickelement", q);
        // await this.waitForSelector(q.selector);
        this.lastClickedSelector = q.selector;
        const element = await this.elementFromSelector(q.selector);
        const box = await element.boundingBox();
        global.browserToolWindow.webContents.send("rippleEffect", {
            x: box.x / this.width,
            y: box.y / this.height,
            width: box.width / this.width,
            height: box.height / this.height,
            uuid: this.taskID
        });
        await element.click();
        // await this.page.click(q.selector);
        await this._waitFor();
    }
    async click (x, y, mode, absolute, rightClick) {
        if(absolute) {
            if(mode === "mouseup") return;
            const selector = await this.selector(x, y, rightClick);
            await this._clickElement({ mode, selector });
        } else {
            await this._click({x, y, mode});
        }
    }
    async _click (q) {
        let x = q.x;
        let y = q.y;
        let type = q.mode;


        await this._queue("click", q);

        const selector = await this.selector(x, y, false);
        const element = await this.elementFromSelector(selector);
        const box = await element.boundingBox();

        global.browserToolWindow.webContents.send("rippleEffect", {
            x: box.x / this.width,
            y: box.y / this.height,
            width: box.width / this.width,
            height: box.height / this.height,
            uuid: this.taskID
        });

        global.browserToolWindow.webContents.send("clearPopups", this.taskID);

        x = x * this.width;
        y = y * this.height;

        if(type === "mousedown") {
            const select = await this._page.getSelect(x, y);

            if(select === false) {
                await this.page.mouse.click(x, y);
                // await this.page.waitForTimeout(20);
                // await this.page.mouse.move(x, y);
                // await this.page.waitForTimeout(50);
                // await this.page.mouse.down();
            } else {
                // TODO: Prompt <select> on UI preview
                this.disableNextMouseUp = true;

                select["pageWidth"] = this.width;
                select["pageHeight"] = this.height;
                select["uuid"] = this.taskID;
                global.browserToolWindow.webContents.send("spawnSelect", select);

            }
        } else if(type === "mouseup") {
            if(this.disableNextMouseUp) {
                this.disableNextMouseUp = false;
                return;
            }
            // await this.page.mouse.move(x, y);
            // await this.page.waitForTimeout(20);
            // await this.page.mouse.up();
            // await this.page.waitForTimeout(50);
        }
        await this._waitFor();
    }

    async playback (filePath) {
        return new Promise(async resolve => {
            const fs = require("fs");
            const queue = JSON.parse(fs.readFileSync(filePath, "utf8"));
            for(let i = 0; i < queue.length; i++) {
                const q = queue[i];
                const type = q.type;
                delete q.type;

                let func;   

                switch (type) {
                    case "click": func = await this._click(q); break;
                    case "key": func = await this._key(q); break;
                    case "scroll": func = await this._scroll(q); break;
                    case "select": func = await this._select(q); break;
                    case "goto":  func = await this._goto(q); break;
                    case "wait": func = await this._wait(q); break;
                    case "back": func = await this.back(); break;
                    case "forward": func = await this.forward(); break;
                    case "keyarray": func = await this._keyArray(q); break;
                    case "keyelement": func = await this._keyElement(q); break;
                    case "clickelement": func = await this._clickElement(q); break;
                }
                
                // console.log(q);
                // if(func) {
                //     await func(q);
                // } else {
                //     console.log("Unknown type:", type);
                // }
            }


            let j = 0;
            let threshold = 2;
            this.resolve = resolve;
            this.interval = setInterval(() => {
                if(this.queue.length === 0) j++;

                if(j > threshold) {
                    this.fakeQueue = [];
                    resolve();

                    clearInterval(this.interval);
                }
            }, 500);
        });
    }

    async stopPlayback () {
        this.queue = [];
        this.fakeQueue = [];
        this.queueReady = true;
        if(this.interval) {
            this.resolve();
            clearInterval(this.interval);
            this.interval = undefined;
        } else {
            global.browserToolWindow.webContents.send("playbackComplete");
        }
    }

    async startRecording () {
        this.recording = true;
        this.fakeQueue = [];
    }

    async stopRecording (filePath) {
        this.recording = false;
        if(filePath) {
            let fakeQueue = JSON.parse(JSON.stringify(this.fakeQueue));
            this.fakeQueue = [];

            let parsedQueue = [];
            let word = [];
            let selector = "";
            

            for(let i = 0; i < fakeQueue.length; i++) {
                let o = fakeQueue[i];
                
                if(o.type === "keyelement") {
                    if(o.selector === selector || selector === "") {

                    }
                    

                }

            }

            const fs = require("fs");
            if(!fs.existsSync("./records")) fs.mkdirSync("./records");
            fs.writeFileSync(filePath, JSON.stringify(fakeQueue));
            return fakeQueue;
        }
        this.fakeQueue = [];
    }

    async _keyArray (q) {
        await this._queue("keyarray", q);
        await this.page.type(q.selector, q.keys);
        await this._waitFor();
    }

    async scroll (x, y, scrollX, scrollY) {
        await this._scroll({x, y, scrollX, scrollY});
    }
    async _scroll (q) {
        let x = q.x;
        let y = q.y;
        let scrollX = q.scrollX;
        let scrollY = q.scrollY;

        await this._queue("scroll", q);
        await this.page.mouse.wheel({
            deltaX: x,
            deltaY: y,
        });
        await this._page.scroll(scrollX, scrollY);
        await this._waitFor();
    }

    async screenshot () {
        return await this.page.screenshot({
            // quality: 100,
            type: "jpeg",
            quality: 20,
            encoding: "base64"
        });
    }

    async cleanup () {
        await this.browser.close();
    }
}
const { request } = require("http");
const browserManager = new BrowserManager(BrowserInstance);

const cleanup = async () => {
    console.log("Cleaning up browser instances");
    await browserManager.destroyAll();
}
process.on('beforeExit', () => cleanup());
// process.on('uncaughtException', () => cleanup());

const termSignals = ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 
'SIGTRAP', 'SIGABRT',
'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'];
termSignals.forEach((eventType) => {
    process.on(eventType, async () => await cleanup());
});





ipcMain.on("cleanup", cleanup);


ipcMain.on("browserDuplicate", (e, data) => {
    browserManager.duplicate(data.uuid);
});

ipcMain.on("initialized", () => {

    const createBrowser = (uuid, url) => {
        browserManager.createBrowserInstance(uuid, url);
        global.browserToolWindow.webContents.send("taskCreated", { uuid });
    }

    // createBrowser("test1", "https://google.com");
    // createBrowser("test2", "https://google.com");
    // createBrowser("test3", "https://google.com");
});
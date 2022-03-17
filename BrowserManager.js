const path = require('path');
try {
    module.paths.push(path.join(process.cwd(), 'resources/app.asar/node_modules')); // FIXES AES-JS REQUIRE ISSUE
    module.paths.push(process.cwd());
    module.paths.push(path.join(process.cwd(), 'node_modules'));
    module.paths.push(path.join(process.resourcesPath, '/app.asar/node_modules'));
    module.paths.push(path.join(process.resourcesPath, '/app.asar'));
    module.paths.push(path.join(process.cwd(), 'SlapIO.app/Contents/Resources/app.asar/node_modules'));
    module.paths.push(path.join(process.cwd(), 'SlapIO.app/Contents/Resources/app.asar'));
    module.paths.push(path.join(process.execPath, ".../../Resources/app.asar"));
    module.paths.push(path.join(process.execPath, ".../../Resources/app.asar/node_modules"));
    module.paths.push(process.resourcesPath);
    module.paths.push(path.join('/Applications/SlapIO.app/Contents/Frameworks/SlapIO Helper.app/Contents/MacOS/SlapIO Helper', '../../../../../Resources/app.asar'));
    module.paths.push(path.join('/Applications/SlapIO.app/Contents/Frameworks/SlapIO Helper.app/Contents/MacOS/SlapIO Helper', '../../../../../Resources/app.asar/node_modules'));
    module.paths.push(path.join(process.execPath, '../../../../../Resources/app.asar'));
    module.paths.push(path.join(process.execPath, '../../../../../Resources/app.asar/node_modules'));
} catch (error) {}

const paths = [
    path.join(process.cwd(), '/resources/app.asar/node_modules'),
    path.join(process.cwd(), '/resources/app.asar'),
    path.join(process.cwd(), 'SlapIO.app/Contents/Resources/app.asar/node_modules'),
    path.join(process.cwd(), 'SlapIO.app/Contents/Resources/app.asar'),
    path.join(process.cwd(), 'Contents/Resources/app.asar'),
    path.join(process.cwd(), 'Contents/Resources/app.asar/node_modules'),
    path.join(process.execPath, ".../../Resources/app.asar"),
    path.join(process.execPath, ".../../Resources/app.asar/node_modules"),
    path.join(process.execPath, '../../../../../Resources/app.asar'),
    path.join(process.execPath, '../../../../../Resources/app.asar/node_modules'),
    path.join('/Applications/SlapIO.app/Contents/Frameworks/SlapIO Helper.app/Contents/MacOS/SlapIO Helper', '../../../../../Resources/app.asar'),
    path.join('/Applications/SlapIO.app/Contents/Frameworks/SlapIO Helper.app/Contents/MacOS/SlapIO Helper', '../../../../../Resources/app.asar/node_modules')
];

paths.map((path) => {
    require.main.paths.push(path);
});

const electron = require('electron');
const {
    session,
    net,
    dialog
} = require('electron');
const ipcMain = electron.ipcMain;

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

module.exports = BrowserManager;
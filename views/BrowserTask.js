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
    net
} = require('electron');
const ipcMain = electron.ipcMain;

const COLOR_SUCCESS = "#0F9E5E";
const COLOR_ERROR = "#FC4850";
const COLOR_BLUE = "#5E98FE";
const COLOR_ORANGE = "#f88f4a";
const COLOR_PINK = "#E88BFF";
const COLOR_GRAY = "#686868";

class BrowserTask {

    _setInteraction(started) {
        global.mainWindow.webContents.send("setInteraction", {
            task: this.taskID,
            started: started
        });
    }

    _status(text, color) {
        global.mainWindow.webContents.send("updateStatus", {
            task: this.taskID,
            status: text,
            color: color
        });
        if (text !== 'Ready') {
            //global.taskTelemetry(this.taskID, text);
            global.updateTaskStatus({logid: this.logFileName, status: text});
        }
    }


    constructor(data) {
        this.running = false;
        this.taskID = data.uuid;
        this.siteURL = data.siteURL;

        this.useProxy = data.data.useProxy;
        this.proxyGroup = data.data.proxyGroup; // false if undefined - no proxies enabled
        this.proxy = false;
        if (this.useProxy) {
            let proxyGroup = global.proxies["groups"][this.proxyGroup];
            if(proxyGroup && proxyGroup.length > 0) {
                this.proxy = proxyGroup[Math.floor(Math.random() * proxyGroup.length)].proxy;
            }
        }


        setTimeout(() => {
            global.browserToolWindow.webContents.send("taskCreated", data);
        }, 500);


        ipcMain.on("taskDestroyed", (e, data) => {
            if (this.taskID === data.task || data.task === "all") {
                this.running = false;
                global.browserToolWindow.webContents.send("taskDestroyed", this.taskID);

                this.stop();
            }

            // TODO: ADD CLEANUP
        });

        ipcMain.on("taskStarted", (e, data) => {
            if (this.taskID === data.task || data.task === "all") {
                if(!this.running) {
                    this.running = true;
                    this._setInteraction(true);

                    this.start();
                }
            }
        });

        ipcMain.on("taskPaused", (e, data) => {
            if (this.taskID === data.task || data.task === "all") {
                if(this.running) {
                    this.running = false;
                    this._setInteraction(false);
                    this._status("Ready", COLOR_GRAY);
                    global.browserToolWindow.webContents.send("taskPaused", this.taskID);

                    this.stop();
                }
            }
        });

        this._status("Ready", COLOR_GRAY);
    }

    async start () {
        this._status("Starting", COLOR_GRAY);

        await global.browserManager.createBrowserInstance(this.taskID, this.siteURL, this.proxy);
        this._status("Started!", COLOR_BLUE);
    }

    async stop () {
        await global.browserManager.destroyBrowserInstance(this.taskID);
    }
}

module.exports = BrowserTask;
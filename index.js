const isDev = true;

const express = require("express");
const path = require("path");
const expressApp = express();


// serve views/monaco-editor on views endpoint
expressApp.use("/views", express.static(path.join(__dirname, "views")));

expressApp.use(express.static(path.join(__dirname, "views")));
// expressApp.use("/", (req, res) => {
//     res.sendFile(`${__dirname}/views/index.html`);
// });

expressApp.listen(3030, () => {
    console.log("Local server started!");
});



const {
    ipcMain,
    protocol,
    session,
    dialog,
    app,
    BrowserWindow,
    ipcRenderer
} = require("electron");

const chromePaths = require("chrome-paths");
if(!chromePaths.chrome || !require("fs").existsSync(chromePaths.chrome)) {
    dialog.showErrorBox("Chrome Not Found", "Please install chrome, if chrome is installed please report this in the Discord!");
    process.exit(-1);
}

app.commandLine.appendSwitch("remote-debugging-port", "9222");

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

    win.on("resize", (data) => {
        BrowserInstance.resize(win.getSize()[0], win.getSize()[1]);
    });

    // win.maximize();

    global.browserToolWindow = win;

    global.browserToolWindow.show();
    global.browserToolWindow.loadURL(`http://localhost:3030/`);
    if(isDev) {
        global.browserToolWindow.openDevTools({ mode: "detach"});
    }
}

const appReady = async () => {
    console.log("Creating main window");
    createWindow();
}

app.whenReady().then(() => {
    appReady();
});

// DEV-IMPORTS-START
const BrowserManager = require("./BrowserManager.js");
let BrowserInstance = require("./BrowserInstance.js");
const { Browser } = require("puppeteer");
BrowserInstance.init(BrowserWindow, ipcMain, session);
let BrowserInstanceClass = BrowserInstance.BrowserInstance;
// DEV-IMPORTS-END

const browserManager = new BrowserManager(BrowserInstanceClass);

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
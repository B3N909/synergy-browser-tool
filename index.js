const isDev = true;
if(isDev) {
    const server = require("./server.js");
    server();
}


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

const authenticate = () => {
    return new Promise(resolve => {
        const authWindow = new BrowserWindow({
            "use-content-size": true,
            center: true,
            show: true,
            frameless: true,
            "always-on-top": true,
        });
        authWindow.setMenu(null);
        
        global.authWindow = authWindow;

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

        if(isDev) {
            global.authWindow.close();
            resolve(true);
        }

        authWindow.on("page-title-updated", () => {
            setImmediate(async () => {
                const title = authWindow.getTitle();
                if (title.startsWith('Denied')) {
                    resolve(false);
                    authWindow.close();
                } else if (title.startsWith('Success')) {
                    const cookies = await session.defaultSession.cookies.get({ name: "auth_token" });
                    if(cookies && cookies.length > 0 && cookies[0].value && cookies[0].value.length > 0) {
                        resolve(cookies[0].value);
                    } else {
                        resolve(false);
                    }
                    authWindow.close();
                }
            });
        });
    
        authWindow.loadURL("http://localhost:8080/auth/google/url");
    });
}

const electronReload = require("electron-reload");

const createWindow = () => {
    global.browserToolWindow.show();
    global.browserToolWindow.loadURL(`file://${__dirname}/views/index.html`);
    global.browserToolWindow.openDevTools({ mode: "detach"});
}

const appReady = async () => {
    const auth = await authenticate();
    console.log("Auth: " + auth);
    if(auth) {
        console.log("Creating main window");
        createWindow();
    } else {
        dialog.showErrorBox("Authentication Failed", "Please restart...");
        process.exit(-1);
    }
}

app.whenReady().then(() => {
    appReady();
});

const BrowserManager = require("./BrowserManager.js");
const BrowserInstance = require("./BrowserInstance.js");
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
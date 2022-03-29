
const colors = require("colors");

const request = require("request");

const fetchWSUrl = (id) => {
    return new Promise(r => {
        if(typeof id === "undefined") {
            request({
                url: "http://localhost:9222/json/version",
                method: "GET",
                json: true
            }, (err, resp, body) => {
                r(body.webSocketDebuggerUrl);
            });
        } else {
            request({
                url: "http://localhost:9222/json",
                method: "GET",
                json: true
            }, (err, resp, body) => {
                for(let i = 0; i < body.length; i++) {
                    if(body[i].id === id) {
                        r(body[i].webSocketDebuggerUrl);
                    }
                }
            });
        }
    });
}

class CDPClass {
    constructor(cdpSocket) {
        if(typeof cdpSocket === "string") cdpSocket = new CDPSocket(cdpSocket);
        this.cdpSocket = cdpSocket;
    }

    on(method, callback) {
        return this.cdpSocket.on(method, callback);
    }

    once(method, callback) {
        return this.cdpSocket.once(method, callback);
    }
}

class Page extends CDPClass {
    constructor(...args) {
        super(...args);
    }

    async connect () {
        return await this.cdpSocket.connect();
    }

    async enable () {
        return await this.cdpSocket.send("Page.enable");
    }

    async createIsolatedWorld (params) {
        return await this.cdpSocket.send("Page.createIsolatedWorld", params);
    }

    navigate (params) {
        return this.cdpSocket.send("Page.navigate", params);
    }
}

class Target extends CDPClass {
    constructor(cdpSocket) {
        super(cdpSocket);
    }

    attachToTarget (targetId, flatten) {
        console.log(JSON.stringify({ targetId, flatten }));
        return this.cdpSocket.send("Target.attachToTarget", { targetId, flatten });
    }

    createTarget (params) {
        return this.cdpSocket.send("Target.createTarget", params);
    }

    reload (params) {
        return this.cdpSocket.send("Target.reload", params);
    }
}

class CDPSocket {

    constructor(wsEndpoint) {
        this._id = 0;
        const WebSocket = require("ws");
        this.wsEndpoint = wsEndpoint;
        this.ws = new WebSocket(wsEndpoint, {
            preMessageDeflate: false
        });

        this.resolveMap = new Map();
        const EventEmitter = require("events");
        this.emitter = new EventEmitter();
    }

    async connect () {
        await new Promise(r => this.ws.once("open", r));
        console.log("CDPSocket connected!");
        this.ws.on("message", msg => {
            msg = msg.toString();

            let json;
            try {
                json = JSON.parse(msg);
            } catch (err) {
                console.error("Received invalid JSON from CDP:", msg);
            }

            if(json.id && this.resolveMap.has(json.id)) {
                // console.log("Resolved " + json.id);
                console.log(JSON.stringify(json).toString().gray);
                this.resolveMap.get(json.id)(json.result);
                this.resolveMap.delete(json.id);
                if(json.error) {
                    console.error("Error in CDP (" + json.error.code + "): " + json.error.message)
                }
            } else if (json.method) {
                console.log(JSON.stringify(json).red);
                this.emitter.emit(json.method, json.params);
            } else {
                
            }
        });

        await this.send("Target.setDiscoverTargets", { discover: true });
    }

    _wait (id, resolve) {
        this.resolveMap.set(id, resolve);
    }

    async send (method, params) {
        return await new Promise(r => {
            this._id++;

            this._wait(this._id, r);

            this.ws.send(JSON.stringify({
                id: this._id, method, params
            }));
        });
    }

    on (method, callback) {
        this.emitter.on(method, callback);
    }

    once(method, callback) {
        this.emitter.once(method, callback);
    }
}

class Network extends CDPClass {
    constructor(...args) {
        super(...args);
    }

    setRequestInterception (params) {
        return this.cdpSocket.send("Network.setRequestInterception", params);
    }

    continueInterceptedRequest (params) {
        return this.cdpSocket.send("Network.continueInterceptedRequest", params);
    }
}

class Browser {
    constructor () {
        this.chromePaths = require("chrome-paths");
        this.executable = this.chromePaths.chrome;
        this.execFile = require("child_process").execFile;
    }

    async launch (headless, args) {
        let _args = [`--user-data-dir="${require("path").join(__dirname, "temp")}"`, "--remote-debugging-port=9222" ];
        console.log(_args);
        _args = _args.concat(args);
        if(headless) _args.push("--headless");

        this.process = require("child_process").exec(`"` + this.executable + `" ${_args.join(" ")}`);

        await new Promise(r => setTimeout(r, 1000));

        let wsUrl = await fetchWSUrl();
        console.log("Browser WS URL: " + wsUrl);

        this.cdpSocket = new CDPSocket(wsUrl);
        await this.cdpSocket.connect();

        this.target  = new Target(this.cdpSocket);
        this.page    = new Page(this.cdpSocket);
    }
}

class BrowserPage extends Page {
    constructor (browser, targetId) {
        super(`ws://localhost:9222/devtools/page/${targetId}`);
        this.browser = browser;
        this.targetId = targetId;
        this.network = new Network(this.cdpSocket);
    }

    async goto (url, params) {
        if(typeof params === "undefined") params = {};
        params.url = url;

        return await this.navigate(params);
    }

    async loadFile (path, params) {
        if(typeof params === "undefined") params = {};
        params.url = "file://" + path;

        return await this.navigate(params);
    }
}

class Chromex extends Browser {
    constructor(...args) {
        super(...args);
    }

    async newPage () {
        let page = new BrowserPage(this, (await this.target.createTarget({
            url: "https://google.com",
            newWindow: false,
        })).targetId);
        await page.connect();
        return page;
    }
}

(async () => {
    const browser = new Chromex();
    await browser.launch();
    const page = await browser.newPage();

    page.network.on("Network.requestIntercepted", (params) => {
        console.log(JSON.stringify(params.request.headers));
        page.network.continueInterceptedRequest({
            interceptionId: params.interceptionId,
            // headers: {
            //     ...params.request.headers,
            //     "sec-fetch-dest": "document",
            //     "sec-fetch-mode": "navigate",
            //     "sec-fetch-site": "none"
            // }
        })
    });

    browser.target.on("Target.targetCreated", (params) => {
        if(params.targetInfo.type === "iframe") {
            console.log(JSON.stringify(params).bgRed);
        }
    });

    // await page.network.setRequestInterception({
    //     "patterns": [{
    //         urlPattern: "*"
    //         // "resourceType": "Document"
    //     }]
    // });

    await page.loadFile(require("path").join(__dirname, "index.html"));


    // let pageWS = await fetchWSUrl(page.targetId);
    // console.log(pageWS);
    // const pageSocket = new CDPSocket(pageWS);
    // await pageSocket.connect();

    // console.log(await page.cdpSocket.send("Page.navigate", { url: "https://yahoo.com" }));

    // let r = await page.connect();
    // console.log(r);

    // let v2 = await browser.page.enable();
    // console.log(v2);

    // let v = await page.goto("https://yahoo.com");
    // console.log(v);
    // // await page.loadFile(require("path").join(__dirname, "index.html"));
    // console.log("Finished.");
})();

// const puppeteer = require("puppeteer");
// for(let i = 0; i < 10; i++) {
//     (async () => {
//         const browser = await puppeteer.launch({
//             headless: false
//         });
//         const page = await browser.newPage();
//         await page.goto('https://google.com');
//     })();
// }
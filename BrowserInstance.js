const { ipcRenderer, ipcMain } = require('electron');
const path = require('path');
const { isBuffer } = require('util');
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

        await this.page.evaluateOnNewDocument(() => {
            const data = JSON.parse("{\"webgl\":{\"2849\":1,\"2885\":1029,\"2886\":2305,\"2928\":{\"0\":0,\"1\":1},\"2930\":true,\"2931\":1,\"2932\":513,\"2962\":519,\"2963\":2147483647,\"2964\":7680,\"2965\":7680,\"2966\":7680,\"2968\":2147483647,\"2978\":{\"0\":0,\"1\":0,\"2\":300,\"3\":150},\"3024\":true,\"3088\":{\"0\":0,\"1\":0,\"2\":300,\"3\":150},\"3106\":{\"0\":0,\"1\":0,\"2\":0,\"3\":0},\"3107\":[true,true,true,true],\"3317\":4,\"3333\":4,\"3379\":16384,\"3386\":{\"0\":16384,\"1\":16384},\"3408\":4,\"3410\":8,\"3411\":8,\"3412\":8,\"3413\":8,\"3414\":24,\"7936\":\"WebKit\",\"7937\":\"WebKit WebGL\",\"7938\":\"WebGL 1.0\",\"32773\":{\"0\":0,\"1\":0,\"2\":0,\"3\":0},\"32777\":32774,\"32936\":1,\"32937\":4,\"32938\":1,\"32969\":1,\"32971\":1,\"33170\":4352,\"33901\":{\"0\":1,\"1\":511},\"33902\":{\"0\":1,\"1\":16},\"34016\":33984,\"34024\":16384,\"34076\":16384,\"34467\":{},\"34816\":519,\"34817\":7680,\"34818\":7680,\"34819\":7680,\"34877\":32774,\"34921\":16,\"34930\":16,\"35660\":16,\"35661\":32,\"35724\":\"WebGL GLSL ES 1.0 (1.0)\",\"35738\":5121,\"35739\":6408,\"36004\":2147483647,\"36005\":2147483647,\"36347\":512,\"36348\":15,\"36349\":224,\"37443\":37444,\"37445\":\"Apple Inc.\",\"37446\":\"Apple GPU\"},\"navigator\":{\"cookieEnabled\":true,\"maxTouchPoints\":5,\"appCodeName\":\"Mozilla\",\"appName\":\"Netscape\",\"appVersion\":\"5.0 (iPhone; CPU iPhone OS 14_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.1 Mobile/15E148 Safari/604.1\",\"platform\":\"iPhone\",\"product\":\"Gecko\",\"productSub\":\"20030107\",\"userAgent\":\"Mozilla/5.0 (iPhone; CPU iPhone OS 14_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.1 Mobile/15E148 Safari/604.1\",\"vendor\":\"Apple Computer, Inc.\",\"vendorSub\":\"null\",\"language\":\"en-us\",\"onLine\":true},\"navigatorFunctions\":{\"getStorageUpdates\":\"navigator.getStorageUpdates\",\"sendBeacon\":\"navigator.sendBeacon\",\"requestMediaKeySystemAccess\":\"navigator.requestMediaKeySystemAccess\",\"getGamepads\":\"navigator.getGamepads\",\"javaEnabled\":\"navigator.javaEnabled\"},\"navigatorObjects\":{\"geolocation\":{\"name\":\"Geolocation\"},\"mediaCapabilities\":{\"name\":\"MediaCapabilities\"},\"languages\":{\"length\":1,\"name\":\"Array\"},\"plugins\":{\"length\":0,\"name\":\"PluginArray\"},\"mimeTypes\":{\"length\":0,\"name\":\"MimeTypeArray\"}},\"window\":{\"innerHeight\":1702,\"innerWidth\":980,\"outerHeight\":896,\"outerWidth\":414,\"screenX\":0,\"screenLeft\":0,\"screenY\":0,\"screenTop\":0},\"windowObjects\":{\"screen\":{\"height\":896,\"width\":414,\"colorDepth\":32,\"pixelDepth\":32,\"availLeft\":0,\"availTop\":0,\"availHeight\":896,\"availWidth\":414,\"name\":\"Screen\"},\"visualViewport\":{\"offsetLeft\":0,\"offsetTop\":0,\"pageLeft\":0,\"pageTop\":0,\"width\":980,\"height\":1702,\"scale\":0.422448992729187,\"onresize\":null,\"onscroll\":null,\"name\":\"VisualViewport\"}}}");

            function overwrite (arr, name) {
                const properties = Object.keys(arr);
                for(let i = 0; i < properties.length; i++) {
                    const property = properties[i];
                    const value = arr[property];
                    Object.defineProperty(name, property, {
                        value,
                        writable: false
                    });
                }
            }
            overwrite(data.navigator, navigator);
            overwrite(data.window, window);

            // Properties
            delete Object.getPrototypeOf(navigator).doNotTrack;
            delete Object.getPrototypeOf(navigator).hardwareConcurrency;
            delete Object.getPrototypeOf(navigator).deviceMemory;
            delete Object.getPrototypeOf(navigator).userAgentData;

            Object.defineProperty(navigator, "standalone", {
                value: false,
                writable: false
            });

            // Functions
            delete Object.getPrototypeOf(navigator).userActivation;
            delete Object.getPrototypeOf(navigator).connection;
            delete Object.getPrototypeOf(navigator).webkitTemporaryStorage;
            delete Object.getPrototypeOf(navigator).webkitPersistentStorage;
            delete Object.getPrototypeOf(navigator).xr;
            delete Object.getPrototypeOf(navigator).permissions;
            delete Object.getPrototypeOf(navigator).locks;
            delete Object.getPrototypeOf(navigator).wakeLock;
            delete Object.getPrototypeOf(navigator).usb;
            delete Object.getPrototypeOf(navigator).mediaSession;
            delete Object.getPrototypeOf(navigator).clipboard;
            delete Object.getPrototypeOf(navigator).credentials;
            delete Object.getPrototypeOf(navigator).keyboard;
            delete Object.getPrototypeOf(navigator).mediaDevices;
            delete Object.getPrototypeOf(navigator).storage;
            delete Object.getPrototypeOf(navigator).serviceWorker;
            delete Object.getPrototypeOf(navigator).presentation;
            delete Object.getPrototypeOf(navigator).bluetooth;
            window.chrome = undefined;

            const hook = HTMLMediaElement.prototype.canPlayType;

            HTMLMediaElement.prototype.canPlayType = function() {
                if (arguments[0].includes('mp5a')) return '';
                return hook.apply(this, arguments);
            }
        });

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
                const title = await this.page.evaluate(() => {
                    return (location.hostname.includes(".")  ? (location.hostname.split(".").length > 1 ? location.hostname.split(".")[1] : location.hostname.split(".")[0]) : location.hostname);
                });
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
            return await this.page.evaluate((a) => {
                const element = document.elementFromPoint(a[0], a[1]);
                if(element) {
                    return getComputedStyle(element).cursor;
                } else {
                    return "unset";
                }
            }, [x, y]);
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
                        await this.page.evaluate(() => { return location.href } );
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
        return await this.page.evaluate((e) => {
            const rect = e.getBoundingClientRect();
            return {
                x: rect.x,
                y: rect.y
            };
        }, elementHandle);
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
                return await this.page.evaluateHandle((path) => {
                    const p = `//*[text()=` + path + `]`;
                    return document.evaluate(p, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                }, value);
            } else if(type === "keywords") {
                let keywords = value.split(",");
                
                return await this.page.evaluateHandle((keywords) => {
                    const all = document.querySelectorAll("*");
                    
                    let best = false;
                    
                    for(let i = 0; i < all.length; i++) {
                        let a = all[i];
                        if(!a || !a.textContent) continue;
                        let text = a.textContent;
                        if(text.length < 3) continue;

                        let good = false;
                        for(let j = 0; j < keywords.length; j++) {
                            let isPositive = keywords[j].includes("+");
                            let keyword = keywords[j].substr(1, keywords[j].length).replace(/'/g, "");

                            // check if text includes && is NOT positive

                            if(text.includes(keyword) && !isPositive) {
                                good = false;
                                break;
                            }
                            if(text.includes(keyword) && isPositive) {
                                good = true;
                            }
                        }
                        if(good && a.tagName !== "SCRIPT") {
                            best = a;
                        }
                    }

                    return best;
                }, keywords);
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
        return await this.page.evaluate(a => {
            const x = a[0];
            const y = a[1];
            const type = a[2];

            // does not provide unqiue selector in certain edge cases
            const generateQuerySelector = (el) => {
                if (el.tagName.toLowerCase() == "html")
                    return "HTML";
                var str = el.tagName;
                str += (el.id != "") ? "#" + el.id : "";
                if (el.className) {
                    var classes = el.className.split(/\s/);
                    for (var i = 0; i < classes.length; i++) {
                        if(classes[i] === "") continue;
                        str += "." + classes[i]
                    }
                }
                return generateQuerySelector(el.parentNode) + " > " + str;
            }

            if(type === "none") {
                // no X, Y, type specified: return element at cursor / last element
                const lastElement = (() => {
                    var node = document.getSelection().anchorNode;
                    return (node.nodeType == 3 ? node.parentNode : node);
                 })();
                 return "path:" + generateQuerySelector(lastElement);
            }

            const uniquePath = () => {
                const element = document.elementFromPoint(x, y);
                const selector = generateQuerySelector(element);
                
                // verify path is unique
                if(document.querySelector(selector) === element) {
                    return selector;
                } else {
                    // path is not unique, take into account nth-child, still will not work in all edge cases
                    const index = document.querySelectorAll(selector).indexOf(element);
                    return `${selector}!${index}`;
                }
            }



            if(type === "Full Path") {
                // Use normal full path

                // return unique full path
                return `path:${uniquePath()}`;

            } else if(type === "Text") {
                // Use element's text as our selector
                const element = document.elementFromPoint(x, y);
                const text = element.textContent;

                return `text:'${text}'`;
            } else if(type === "Keywords") {
                // Use element's text as a keywords selector
                
                const element = document.elementFromPoint(x, y);
                const text = element.textContent;

                return `keywords:+'${text}'`;
            } else {
                console.log(`Unknown event selector type: ${type}`.red);
            }
        }, [x, y, type]);

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
        const value = await this.page.evaluate((element) => {
            let e = element;
            if(element.tagName !== "input") {
                let nElement = element.querySelector("input");
                if(nElement) {
                    e = nElement;
                }
            }
            return e.value;
        }, element)
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
            const select = await this.page.evaluate((data) => {
                function getUniqueSelector(node) {
                    let selector = "";
                    while (node.parentElement) {
                        const siblings = Array.from(node.parentElement.children).filter(
                            e => e.tagName === node.tagName
                        );
                        selector =
                            (siblings.indexOf(node)
                                ? `${node.tagName}:nth-of-type(${siblings.indexOf(node) + 1})`
                                : `${node.tagName}`) + `${selector ? " > " : ""}${selector}`;
                        node = node.parentElement;
                    }
                    return `html > ${selector.toLowerCase()}`;
                }


                const element = document.elementFromPoint(data[0], data[1]);
                if(element.nodeName === "SELECT") {
                    const options = element.options;

                    let formattedOptions = [];

                    for(let i = 0; i < options.length; i++) {
                        const option = options[i];
                        formattedOptions.push({
                            text: option.text,
                            value: option.value
                        });
                    }
                    return {
                        options: formattedOptions,
                        rect: JSON.parse(JSON.stringify(element.getBoundingClientRect())),
                        selector: getUniqueSelector(element)
                    };
                }
                return false;
            }, [x, y]);

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
        await this.page.evaluate(() => {
            window.scrollTo(scrollX, scrollY);
        });
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

module.exports = BrowserInstance;
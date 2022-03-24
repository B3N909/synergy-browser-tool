const { ipcRenderer, ipcMain } = require('electron');
const path = require('path');
const { isBuffer } = require('util');
const { runInThisContext } = require('vm');
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


// PAGE-WRAPPER-START
class PageWrapper {

    constructor(page) {
        this.page = page;
    }

    async newDocument (emulation) {
        if(emulation !== "iPhone") return;
        return await this.page.evaluateOnNewDocument(() => {
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
    }

    async title () {
        return await this.page.evaluate(() => {
            return (location.hostname.includes(".")  ? (location.hostname.split(".").length > 1 ? location.hostname.split(".")[1] : location.hostname.split(".")[0]) : location.hostname);
        });
    }

    async tryEvaluate () {
        return await this.page.evaluate(() => { return location.href } );
    }

    async getPosition (handle) {
        return await this.page.evaluate((e) => {
            const rect = handle.getBoundingClientRect();
            return {
                x: rect.x,
                y: rect.y
            };
        }, handle);
    }

    compareTwoStrings(first, second) {
        first = first.replace(/\s+/g, '')
        second = second.replace(/\s+/g, '')
    
        if (first === second) return 1; // identical or empty
        if (first.length < 2 || second.length < 2) return 0; // if either is a 0-letter or 1-letter string
    
        let firstBigrams = new Map();
        for (let i = 0; i < first.length - 1; i++) {
            const bigram = first.substring(i, i + 2);
            const count = firstBigrams.has(bigram)
                ? firstBigrams.get(bigram) + 1
                : 1;
    
            firstBigrams.set(bigram, count);
        };
    
        let intersectionSize = 0;
        for (let i = 0; i < second.length - 1; i++) {
            const bigram = second.substring(i, i + 2);
            const count = firstBigrams.has(bigram)
                ? firstBigrams.get(bigram)
                : 0;
    
            if (count > 0) {
                firstBigrams.set(bigram, count - 1);
                intersectionSize++;
            }
        }
    
        return (2.0 * intersectionSize) / (first.length + second.length - 2);
    }
    
    findBestMatch(mainString, targetStrings) {
        if (!this.areArgsValid(mainString, targetStrings)) throw new Error('Bad arguments: First argument should be a string, second should be an array of strings');
        
        const ratings = [];
        let bestMatchIndex = 0;
    
        for (let i = 0; i < targetStrings.length; i++) {
            const currentTargetString = targetStrings[i];
            const currentRating = this.compareTwoStrings(mainString, currentTargetString)
            ratings.push({target: currentTargetString, rating: currentRating})
            if (currentRating > ratings[bestMatchIndex].rating) {
                bestMatchIndex = i
            }
        }
        
        
        const bestMatch = ratings[bestMatchIndex]
        
        return { ratings: ratings, bestMatch: bestMatch, bestMatchIndex: bestMatchIndex };
    }
    
    areArgsValid(mainString, targetStrings) {
        if (typeof mainString !== 'string') return false;
        if (!Array.isArray(targetStrings)) return false;
        if (!targetStrings.length) return false;
        if (targetStrings.find( function (s) { return typeof s !== 'string'})) return false;
        return true;
    }


    async getElementByText(text, skip) {
        if(!skip) this.startTime = Date.now();
        let v = await this.page.evaluateHandle((text) => {

            function compareTwoStrings(first, second) {
                first = first.replace(/\s+/g, '')
                second = second.replace(/\s+/g, '')
            
                if (first === second) return 1; // identical or empty
                if (first.length < 2 || second.length < 2) return 0; // if either is a 0-letter or 1-letter string
            
                let firstBigrams = new Map();
                for (let i = 0; i < first.length - 1; i++) {
                    const bigram = first.substring(i, i + 2);
                    const count = firstBigrams.has(bigram)
                        ? firstBigrams.get(bigram) + 1
                        : 1;
            
                    firstBigrams.set(bigram, count);
                };
            
                let intersectionSize = 0;
                for (let i = 0; i < second.length - 1; i++) {
                    const bigram = second.substring(i, i + 2);
                    const count = firstBigrams.has(bigram)
                        ? firstBigrams.get(bigram)
                        : 0;
            
                    if (count > 0) {
                        firstBigrams.set(bigram, count - 1);
                        intersectionSize++;
                    }
                }
            
                return (2.0 * intersectionSize) / (first.length + second.length - 2);
            }
            
            function findBestMatch(mainString, targetStrings) {
                if (!areArgsValid(mainString, targetStrings)) throw new Error('Bad arguments: First argument should be a string, second should be an array of strings');
                
                const ratings = [];
                let bestMatchIndex = 0;
            
                for (let i = 0; i < targetStrings.length; i++) {
                    const currentTargetString = targetStrings[i];
                    const currentRating = compareTwoStrings(mainString, currentTargetString)
                    ratings.push({target: currentTargetString, rating: currentRating})
                    if (currentRating > ratings[bestMatchIndex].rating) {
                        bestMatchIndex = i
                    }
                }
                
                
                const bestMatch = ratings[bestMatchIndex]
                
                return { ratings: ratings, bestMatch: bestMatch, bestMatchIndex: bestMatchIndex };
            }
            
            function areArgsValid(mainString, targetStrings) {
                if (typeof mainString !== 'string') return false;
                if (!Array.isArray(targetStrings)) return false;
                if (!targetStrings.length) return false;
                if (targetStrings.find( function (s) { return typeof s !== 'string'})) return false;
                return true;
            }


            const all = document.querySelectorAll("*");
            
            let best = false;
            
            let matches = [];

            for(let i = 0; i < all.length; i++) {
                let a = all[i];
                let content = "";
                if(a.textContent) {
                    let THRESHOLD = 5;
                    if(a.textContent.length > text.length - THRESHOLD && a.textContent.length < text.length + THRESHOLD) {
                        content = a.textContent;
                    }
                }
                matches.push(content);
            }

            let match = findBestMatch(text, matches);
            let bestMatchIndex = match.bestMatchIndex;

            if(match.bestMatch.rating > 0.5) {
                return all[bestMatchIndex];
            }
            return false;
        }, text);
        if((await v.jsonValue()) === false) {
            if((Date.now() - this.startTime) > 2000) {
                console.log(" (Timeout) getElementsByText timed out".red);
                return false;
            }
            return await new Promise(r => {
                setTimeout(async () => {
                    r(await this.getElementByText(text, true));
                }, 200);
            });
        }
        return v;




        return await this.page.evaluateHandle((path) => {
            const p = `//*[text()=` + path + `]`;
            console.log(p);
            return document.evaluate(p, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        }, text);
    }

    async getElementByKeywords(keywords, skip) {
        if(!skip) this.startTime = Date.now();
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
    
    async getCursor(x, y) {
        return await this.page.evaluate((a) => {
            const element = document.elementFromPoint(a[0], a[1]);
            if(element) {
                return getComputedStyle(element).cursor;
            } else {
                return "unset";
            }
        }, [x, y]);
    }

    async selector(x, y, type, variableName) {
        return await this.page.evaluate(a => {
            const x = a[0];
            const y = a[1];
            const type = a[2];
            const variableName = a[3];

            /**
             * Get a unique CSS selector for a given DOM node
             * @param {HTMLElement} element - DOM node
             * @return {string} Unique CSS selector for the given DOM node
             */
            function getPath (element) {
                /**
                * Gets the element node that is a sibling to this element node (a direct child of the same parent) and is immediately
                * previous to it in the DOM tree. It's a fix for IE that does not support :nth-child pseudoselector
                * @param {HTMLElement} element - DOM node
                * @return {string} Unique CSS selector for the given DOM node
                */
                const previousElementSiblingPolyfill = (element) =>{
                    element = element.previousSibling;
                    // Loop through ignoring anything not an element
                    while(element !== null) {
                        if(element.nodeType === Node.ELEMENT_NODE) {
                            return element;
                        } else {
                            element = element.previousSibling;
                        }
                    }
                }
            
            
                /**
                 * Gets the element node that is a sibling to this element node (a direct child of the same parent) and is immediately
                 * previous to it in the DOM tree. It's a fix for IE that does not support :nth-child pseudoselector
                 * @param {HTMLElement} element - DOM node
                 * @return {string} Unique CSS selector for the given DOM node
                 */
                const previousElementSibling = (element) =>{
                    if(element.previousElementSibling !== 'undefined') {
                        return element.previousElementSibling
                    } else {
                        return previousElementSiblingPolyfill(element);
                    }
                }
            
                const getPath = (element) => {
                    // False on non-elements
                    if(!(element instanceof HTMLElement)) {
                        return false;
                    }
                
                    const path = [];
                    // If element is null it's the end of partial. It's a loose element which has, sofar, not been attached to a parent in the node tree.
                    while(element !== null && element.nodeType === Node.ELEMENT_NODE) {
                        let selector = element.nodeName;
                
                        if (element.id) {
                            selector += `#${element.id}`;
                        } else {
                            // Walk backwards until there is no previous sibling
                            let sibling = element;
                
                            // Will hold nodeName to join for adjacent selection
                            let siblingSelectors = [];
                
                            while(sibling !== null && sibling.nodeType === Node.ELEMENT_NODE) {
                                siblingSelectors.unshift(sibling.nodeName);
                                sibling = previousElementSibling(sibling);
                            }
                
                            // :first-child does not apply to HTML
                            if(siblingSelectors[0] !== 'HTML') {
                                siblingSelectors[0] = siblingSelectors[0] + ':first-child';
                            }
                
                            selector = siblingSelectors.join(' + ');
                        }
                        path.unshift(selector);
                        element = element.parentNode;
                    }
                    return path.join(' > ');
                }

                return getPath(element);
            }

            if(type === "none") {
                // no X, Y, type specified: return element at cursor / last element
                const lastElement = (() => {
                    var node = document.getSelection().anchorNode;
                    return (node.nodeType == 3 ? node.parentNode : node);
                 })();
                 return "path:" + getPath(lastElement);
            }

            const uniquePath = () => {
                const element = document.elementFromPoint(x, y);
                return getPath(element);
            }



            if(type === "Full Path") {
                // Use normal full path

                // return unique full path
                return `path:${uniquePath()}`;

            } else if(type === "Text") {
                // Use element's text as our selector
                const element = document.elementFromPoint(x, y);
                if(variableName) {
                    return `text:var?${variableName}`;
                }
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
        }, [x, y, type, variableName]);
    }

    async toInputValue (element) {
        let v = await this.page.evaluate((element) => {
            if(element.tagName !== "input") {
                let ni = element.querySelector("input");
                if(ni && ni.value) return ni.value;
                return "";
            } else {
                if(element && element.value) return element.value;
                return "";
            }
        }, element);
        if(!v) return "";
        return v;
    }

    async getSelect (x, y) {
        return await this.page.evaluate((data) => {
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
    }

    async scroll (x, y) {
        return await this.page.evaluate(() => {
            window.scrollTo(scrollX, scrollY);
        });
    }
}
// PAGE-WRAPPER-END


// BROWSER-INSTANCE-START
class BrowserInstance {
    constructor(uuid, targetURL, emulation) {
        this.ready = false;
        this.disableNextMouseUp = false;
        this.emulation = emulation;

        this.taskID = uuid;
        this.siteURL = targetURL;
        this.proxy = undefined;

        const stealth = require("puppeteer-extra-plugin-stealth")();
        // const UserAgentOverride = require('puppeteer-extra-plugin-stealth/evasions/user-agent-override')
        
        if(emulation === "iPhone") {
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
            this.userAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 14_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.1 Mobile/15E148 Safari/604.1";
        } else if(emulation === "None") {
            this.userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.74 Safari/537.36";
        }
        this.pup = require("puppeteer-extra").use(stealth);
        this.chromePaths = require("chrome-paths");

        this.ready = false;

        this.queueReady = true;

        this.colors = require("colors");
        this._oldLog = console.log;
        console.log = (msg) => {
            try {
                if(typeof msg === "object") msg = JSON.stringify(msg);
                if(typeof msg === "undefined") msg = "UNDEFINED";
                this._oldLog(`[${this.taskID}]`.cyan + " " + msg);
            } catch (err) {
                this._oldLog(`[${this.taskID}]`.cyan + " " + msg);
            }
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
            throw err;
        });
        process.on("unhandledRejection", (err) => {
            this.handleError();
            console.log("FATAL ERROR: ".bgRed);
            console.log(err);
            throw err;
        });
        
    }

    async launch () {

        let options = {
            // executablePath: this.pup.executablePath().replace('app.asar', 'app.asar.unpacked'),
            executablePath: this.chromePaths.chrome,
            headless: true,
            devtools: false,
            args: [
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
                `--user-agent=${this.userAgent}`,
                '--no-sandbox',
                '--disable-infobars'
            ]
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

        await this.page.on("console", (msg) => {
            for (let i = 0; i < msg.args().length; ++i)
                console.log(" (JS) ".green + msg.args()[i]);
        });

        this.width = 375;
        this.height = 812;

        if(this.emulation !== "iPhone") {
            this.width = 900;
            this.height = 800;
        }

        await this.page.setViewport({width: this.width , height: this.height, deviceScaleFactor: 1, isMobile: this.emulation === "iPhone", hasTouch: this.emulation === "iPhone"});


        await this.page.goto(this.siteURL);

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
        this.isSpamming = false;
    }

    async spam () {
        this.isSpamming = true;


        // IF WE RESOLVE, WE ARE DONE
        await new Promise(async r3 => {
            
            // waits for ajax request to be made near recent click
            let ajax = await this.page.evaluate(async () => {
                $._ajax = $.ajax;
                return await new Promise(r2 => {
                    $.ajax = (...args) => {
                        let aj = $._ajax(...args);
                        if(window.recentClick && Math.abs((window.recentClick - Date.now())) < 500) {
                            window.xhrArgs = args;
                            delete window.xhrArgs[0].error;
                            $.ajax = $._ajax;
                            r2(args);
                        }
                        return aj;
                    }
                });
            });
            this._lastRipple = this.lastRipple;

            global.browserToolWindow.webContents.send("foundXHR");
            this._eventLog("AJAX", ajax ? JSON.stringify(ajax) : "NO AJAX");
            this.ajaxInterval = setInterval(async () => {
                console.log("(Spam Mode) AJAX Sent".green);
                let v = await this.page.evaluate(() => {
                    if(window.xhrArgs) {
                        $.ajax(window.xhrArgs[0]);
                        return true;
                    } else {
                        return false;
                    }
                });
                if(v) {
                    global.browserToolWindow.webContents.send("rippleEffect", this._lastRipple);
                }
                if(!v) {
                    clearInterval(this.ajaxInterval);
                    this.ajaxInterval = null;
                    console.log("(Spam Mode) AJAX request finished".green);
                    r();
                }
            }, 500);
        });

    }

    async _recentClick () {
        await this.page.evaluate(recentClick => {
            window.recentClick = recentClick;
        }, Date.now());
    }

    async stopSpam () {
        this.isSpamming = false;
        if(this.ajaxInterval) clearInterval(this.ajaxInterval);
        this.ajaxInterval = null;

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

    _queue (type, data, doSkip) {
        if(typeof this.queue === "undefined") this.queue = [];

        return new Promise(resolve => {
            let b = type === "key";

            const fakeResolve = () => {

                let skip = false;
                if(doSkip) skip = true;

                if(typeof this.wasTyping === "undefined") this.wasTyping = false;

                if(type === "keyelement") {

                    // if we are a different selector && we are typing- we need to push what we have queued before its overriden
                    if(this.wasTyping) {
                        if((this.lastKeySelector && this.lastKeySelector !== data.selector) || data.key === "Tab") {
                            if(this.wasTypingNormal) {
                                this.fakeQueue.push({
                                    type: "keyarray",
                                    text: this.lastInputValue
                                });
                            } else {
                                this.fakeQueue.push({
                                    type: "keyelementarray",
                                    text: this.lastInputValue,
                                    selector: this.lastKeySelector
                                });
                            }
                        }
                    }

                    skip = true; // don't add
                    this.wasTyping = true;
                    this.wasTypingNormal = false;
                    
                    this.lastKeySelector = data.selector;

                    
                    // TODO: if key selector are different, set wasTyping false and push queue
                } else if(type === "key") {
                    skip = true;
                    this.wasTyping = true;
                    this.wasTypingNormal = true;
                } else {
                    if(this.wasTyping) {
                        if(this.wasTypingNormal) {
                            this.fakeQueue.push({
                                type: "keyarray",
                                text: this.lastInputValue
                            });
                        } else {
                            this.fakeQueue.push({
                                type: "keyelementarray",
                                text: this.lastInputValue,
                                selector: this.lastKeySelector
                            });
                        }
                    }
                    this.wasTyping = false;
                }

                if(!skip) {
                    this.fakeQueue.push({
                        type,
                        ...data
                    });
                }

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
  

            if(type === "path") {
                // get JSHandle of DOM element
                await this.page.waitForSelector(value, {
                    visible: true,
                    timeout: 2000,
                });

                const elementHandle = await this.page.$(value);
                if(!elementHandle) return false;
                return elementHandle;
            } else if(type === "text") {
                // get JSHandle of DOM element
                return await this._page.getElementByText(value);
            } else if(type === "keywords") {
                let keywords = value.split(",");
                
                return await this._page.getElementByKeywords(keywords);
            } else {
                console.log(`Invalid type: ${selector}`.red);
            }
        } else {
            console.log(`Invalid selector: ${selector}`.red);
        }
    }

    async selector (x, y, doPrompt, doMiddlePrompt) {
        let type = "none";
        let variableName = false;
        if(x && y) {
            x = x * this.width;
            y = y * this.height;

            // console.log("X: " + x + " Y: " + y);

            if(doPrompt) {
                // Prompt
                global.browserToolWindow.webContents.send("promptEventType", {
                    middleClick: true
                });

                const resolveData = await new Promise(r => {
                    ipcMain.once("eventTypeSelected", (e, data) => {
                        r(data);
                    });
                });
                type = resolveData.type;
                variableName = resolveData.variableName;
                console.log(`Event type selected: `.gray + type.toString().cyan);
            } else {
                type = "Full Path";
                console.log(`Event type defaulted: `.gray + type.toString().cyan);
            }
        
        }

        // console.log("Fetch element at " + x + " " + y);
        // await this._queue("_element", {x, y});
        return await this._page.selector(x, y, type, variableName);

    }

    async waitForSelector (selector) {
        await this.page.waitForSelector(selector);
    }

    async _getVar(variable) {
        global.browserToolWindow.send("variable", {
            uuid: this.taskID,
            variable
        });
        return await new Promise(r => {
            ipcMain.once("variableResponse", (e, data) => {
                r(data.value);
            });
        });
    }

    async keyElementArray(selector, text) {
        let q = {
            selector,
            text
        }
        await this._queue("keyelementarray", q);

        await this._keyElementArray(q);

        await this._waitFor();
    }
    async _keyElementArray(q) {
        const elementHandle = await this.elementFromSelector(q.selector);
        
        console.log("HANDLE");
        console.log(elementHandle);

        if(q.text.includes("vars?")) {
            let variable = q.text.split("vars?")[1];
            q.text = await this._getVar(variable);
        }

        for(let i = 0; i < q.text.length; i++) {
            let k = q.text[i];
            await this.__keyElement(elementHandle, k);
        }
    
    }


    // this needs to be [key, mode, element] since the arguments are directly serialized
    async keyElement (mode, key, selector) {
        await this._keyElement({ mode, key, selector });
    }
    async _keyElement (q) {
        await this._queue("keyelement", q);
        // await this.waitForSelector(q.selector);
        const element = await this.elementFromSelector(q.selector);
        await this.__keyElement(element, q.key);

        await this._waitFor();
    }
    async __keyElement (element, key) {
        await element.press(key);

        const value = await this._page.toInputValue(element);
        this.lastInputValue = value;
    }

    async _keyArray (q) {
        await this._queue("keyarray", q);
        for(let i = 0; i < q.text.length; i++) {
            let k = q.text[i];
            await this.page.keyboard.press(k);
        }
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
        await this.__key(q);
        await this._waitFor();
    }
    async __key (q) {
        if(q.mode === "keydown") {
            await this.page.keyboard.down(q.key);
        } else if(q.mode === "keyup") {
            await this.page.keyboard.up(q.key);
        }

        const selector = await this.selector(); // gets last selector
        const element = await this.elementFromSelector(selector);
        this.lastInputValue = await this._page.toInputValue(element);
    }

    async select (selector, value) {
        await this._select({selector, value});
    }
    async _select (q) {
        await this._queue("select", q);
        await this.page.select(q.selector, q.value);
        await this._waitFor();
    }

    _eventLog (name, data) {
        console.log(name.toString().bgRed);
        console.log(typeof data === "undefined" ? "undefined?" : data);
    }


    async _retry (func, q) {
        console.log("(Timeout) Page reloading, event timed out".red);
        await this.page.reload({
            waitUntil: "domcontentloaded"
        });
        await func(q, true);
        await this._waitFor();
    }

    async clickElement(selector) {
        await this._clickElement({ selector });
    }
    async _clickElement (q, skip) {
        if(!skip) await this._queue("clickelement", q);
        this._recentClick();
        // await this.waitForSelector(q.selector);
        this.lastClickedSelector = q.selector;
        const element = await this.elementFromSelector(q.selector);
        if(!element) {
            await this._retry(this._clickElement, q);
            return;
        }

        const box = await element.boundingBox();
        let ripple = {
            x: box.x / this.width,
            y: box.y / this.height,
            width: box.width / this.width,
            height: box.height / this.height,
            uuid: this.taskID
        };
        this.lastRipple = ripple;
        global.browserToolWindow.webContents.send("rippleEffect", ripple);
        await element.click();
        // await this.page.click(q.selector);
        if(!skip) await this._waitFor();
    }

    // user originated events
    async click (x, y, mode, absolute, rightClick, middleClick) {
        if(absolute) {
            if(mode === "mouseup") return;

            const selector = await this.selector(x, y, rightClick, middleClick); 
            console.log("MiddleClick: " + middleClick);
            console.log("Selector Includes: " + selector.includes("INPUT"));
            console.log("Selector: " + selector);
               
            if(middleClick && selector.includes("INPUT")) {
                
                global.browserToolWindow.webContents.send("promptVariable");
                let v = await new Promise(r => {
                    ipcMain.once("variableSelected", (e, data) => {
                        r(data);
                    });
                });
                if(v) {
                    console.log("Variable selected: ".gray + v.toString().cyan);
                    await this.keyElementArray(selector, `vars?${v}`);
                    return;
                }
            }
            await this._clickElement({ mode, selector });
        } else {
            await this._click({x, y, mode});
        }
    }
    async _click (q, skip) {
        let x = q.x;
        let y = q.y;
        let type = q.mode;


        if(!skip) await this._queue("click", q, skip);

        this._recentClick();


        const selector = await this.selector(x, y, false);
        const element = await this.elementFromSelector(selector);
        if(!element) {
            await this._retry(this._click, q);
            return;
        }
        const box = await element.boundingBox();

        let ripple = {
            x: box.x / this.width,
            y: box.y / this.height,
            width: box.width / this.width,
            height: box.height / this.height,
            uuid: this.taskID
        };
        this.lastRipple = ripple;
        global.browserToolWindow.webContents.send("rippleEffect", ripple);

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
        if(!skip) await this._waitFor();
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
                    case "scroll": func = await this._scroll(q); break;
                    case "select": func = await this._select(q); break;
                    case "goto":  func = await this._goto(q); break;
                    case "wait": func = await this._wait(q); break;
                    case "forward": func = await this.forward(); break;
                    case "back": func = await this.back(); break;
                    case "click": func = await this._click(q); break;
                    case "key": func = await this._key(q); break;
                    case "keyarray": func = await this._keyArray(q); break;
                    case "keyelement": func = await this._keyElement(q); break;
                    case "keyelementarray": func = await this._keyElementArray(q); break;
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
// BROWSER-INSTANCE-END

module.exports = BrowserInstance;
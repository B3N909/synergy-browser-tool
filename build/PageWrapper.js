// PAGE-WRAPPER-START
class PageWrapper {

    constructor(page) {
        this.page = page;
    }

    async newDocument () {
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


    async getElementByText(text) {
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
            return await new Promise(r => {
                setTimeout(async () => {
                    r(await this.getElementByText(text));
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

    async getElementByKeywords(keywords) {
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

    async selector(x, y, type) {
        return await this.page.evaluate(a => {
            const x = a[0];
            const y = a[1];
            const type = a[2];

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

    async toInputValue (element) {
        let v = await this.page.evaluate((element) => {
            if(element.tagName !== "input") {
                let ni = element.querySelector("input");
                return ni.value;
            } else {
                return element.value;
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
 module.exports = PageWrapper;
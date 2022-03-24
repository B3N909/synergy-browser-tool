const puppeteer = require("puppeteer");

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
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
    });
    const page = await browser.newPage();

    await page.goto("https://www.supremenewyork.com/mobile");

    const client = await page.target().createCDPSession();


    const {
        debuggerId
    } = await client.send("Debugger.enable");
    
    await client.send("Debugger.setSkipAllPauses", {
        skip: true
    });

    const v = await client.send("DOMDebugger.setXHRBreakpoint", {
        url: "www.supremenewyork.com",
    });
    console.log(v);

    let blacklist = [];

    client.on("Debugger.paused", async (event) => {
        client.send("Debugger.resume");
    });

    client.on("Debugger.breakpointResolved", (e) => {
        console.log(e);
    });


    // const r2 = await client.send("Network.enable");
    // const r3 = await client.send("Network.setRequestInterception", {
    //     patterns: [{ resourceType: "XHR"}]
    // });

    // let i = 0;

    // client.on("Network.requestIntercepted", async (event) => {
    //     console.log(event.request.url);
    //     const requestId = event.requestId;
    //     if(event.request.url.includes("atc.json") && i === 0) {
    //         i++;
    //         console.log("TIMED OUT FIRST ATC");
    //         await client.send("Network.continueInterceptedRequest", {
    //             interceptionId: event.interceptionId,
    //             errorReason: "TimedOut"
    //         });
    //         client.send("Network.replayXHR", {
    //             requestId
    //         });
    //         client.send("Network.replayXHR", {
    //             requestId
    //         });
    //         client.send("Network.replayXHR", {
    //             requestId
    //         });
    //         client.send("Network.replayXHR", {
    //             requestId
    //         });
    //         return;
    //     }

    //     const response = await client.send("Network.continueInterceptedRequest", {
    //         interceptionId: event.interceptionId
    //     });
    // });
})();
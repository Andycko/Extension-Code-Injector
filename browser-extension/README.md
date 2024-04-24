# Extension

This directory contains the code for the browser extension part of the project.

## Structure

The extension is divided into two main parts:

- `background`: This is the service worker of the extension. It is responsible for handling long-lived connections, such as managing tabs or interacting with the browser.
- `contentScript`: This is the content script of the extension. It is injected into the web pages visited by the user and can interact with the DOM of the page.

## Loading the Extension
To load the extension into your browser for testing, follow these steps:  

- For Chrome:  
  - Open the Extension Management page by navigating to chrome://extensions.
  - Enable Developer Mode by clicking the toggle switch next to Developer mode.
  - Click the LOAD UNPACKED button and select the build directory.

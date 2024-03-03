export const scripts =  [
    {
        name: 'Get browser cookies',
        description: 'Get all cookies from the users browser',
        handle: 'get-cookies',
        script: 'chrome.cookies.getAll({}, (cookies) => { console.log(cookies) })',
        targets: ['background']
    },
    {
        name: 'Get browser history',
        description: 'Get all history from the users browser',
        handle: 'get-history',
        script: 'chrome.history.search({text: ""}, (history) => { console.log(history) })',
        targets: ['background']
    },
    {
        name: 'Get client cookies',
        description: 'Get all cookies accessible to the client from the current tab',
        handle: 'get-client-cookies',
        script: 'console.log(document.cookies)',
        targets: ['contentScript']
    },
]

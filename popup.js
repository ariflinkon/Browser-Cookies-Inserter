document.getElementById('insertCookies').addEventListener('click', function() {
    const cookieInput = document.getElementById('cookieInput').value;
    let cookies;
    try {
        cookies = JSON.parse(cookieInput);
    } catch (e) {
        document.getElementById('status').textContent = 'Invalid JSON format.';
        return;
    }

    if (!Array.isArray(cookies)) {
        document.getElementById('status').textContent = 'JSON must be an array of cookie objects.';
        return;
    }

    cookies.forEach(cookie => {
        const url = `https://${cookie.domain.replace(/^\./, '')}`;
        chrome.cookies.set({
            url: url,
            name: cookie.name,
            value: cookie.value,
            domain: cookie.domain,
            path: cookie.path || '/',
            secure: cookie.secure || false,
            httpOnly: cookie.httpOnly || false,
            expirationDate: cookie.session ? undefined : (Date.now() / 1000) + 3600
        }, function(cookie) {
            if (chrome.runtime.lastError) {
                console.error('Error setting cookie:', chrome.runtime.lastError);
            } else {
                console.log('Cookie set:', cookie);
            }
        });
    });

    document.getElementById('status').textContent = 'Cookies inserted successfully.';
});

document.getElementById('exportCookies').addEventListener('click', function() {
    chrome.cookies.getAll({}, function(cookies) {
        const cookieJson = JSON.stringify(cookies, null, 2);
        const blob = new Blob([cookieJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'cookies.json';
        a.click();
        URL.revokeObjectURL(url);
        document.getElementById('status').textContent = 'Cookies exported successfully.';
    });
});

document.getElementById('deleteCookies').addEventListener('click', function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        const tab = tabs[0];
        const url = new URL(tab.url);
        chrome.cookies.getAll({ domain: url.hostname }, function(cookies) {
            cookies.forEach(cookie => {
                chrome.cookies.remove({ url: `https://${cookie.domain}${cookie.path}`, name: cookie.name }, function(details) {
                    if (chrome.runtime.lastError) {
                        console.error('Error deleting cookie:', chrome.runtime.lastError);
                    } else {
                        console.log('Cookie deleted:', details);
                    }
                });
            });
            document.getElementById('status').textContent = 'Cookies deleted successfully.';
        });
    });
});
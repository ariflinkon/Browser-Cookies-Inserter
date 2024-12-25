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
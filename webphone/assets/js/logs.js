window.WebphoneLogger = (() => {
    const state = {
        extension: null
    };

    function setExtension(extension) {
        state.extension = extension || null;
    }

    function now() {
        return new Date().toLocaleString('en-PH', {
            hour12: true
        });
    }

    function write(level, eventName, message, payload = null) {
        const logBox = document.getElementById('logBox');
        const line = document.createElement('div');

        line.className = `log-line ${level}`;
        line.innerHTML = [
            `<span class="time">[${now()}]</span>`,
            `<span class="level">[${level.toUpperCase()}]</span>`,
            `<strong>${escapeHtml(eventName)}</strong>`,
            escapeHtml(message || '')
        ].join(' ');

        if (payload) {
            line.innerHTML += `\n${escapeHtml(JSON.stringify(payload, null, 2))}`;
        }

        logBox.prepend(line);

        if (window.WEBPHONE_CONFIG?.enableServerClientLogs) {
            sendToServer(level, eventName, message, payload);
        }
    }

    async function sendToServer(level, eventName, message, payload) {
        try {
            await fetch(window.WEBPHONE_CONFIG.clientLogUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    extension: state.extension,
                    level,
                    event_name: eventName,
                    message,
                    payload,
                    browser: navigator.userAgent,
                    url: window.location.href
                })
            });
        } catch (error) {
            console.warn('Unable to save client log to server:', error);
        }
    }

    function clear() {
        const logBox = document.getElementById('logBox');
        if (logBox) {
            logBox.innerHTML = '';
        }
    }

    function escapeHtml(value) {
        return String(value ?? '')
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    return {
        setExtension,
        debug: (eventName, message, payload = null) => write('debug', eventName, message, payload),
        info: (eventName, message, payload = null) => write('info', eventName, message, payload),
        warn: (eventName, message, payload = null) => write('warn', eventName, message, payload),
        error: (eventName, message, payload = null) => write('error', eventName, message, payload),
        clear
    };
})();
window.WebphoneApi = (() => {
    async function provision(extension) {
        const url = `${window.WEBPHONE_CONFIG.provisionUrl}?extension=${encodeURIComponent(extension)}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        const json = await response.json();

        if (!response.ok || !json.success) {
            throw new Error(json.message || 'Provisioning failed.');
        }

        return json;
    }

    async function saveCallLog(payload) {
        const response = await fetch(window.WEBPHONE_CONFIG.saveCallLogUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const json = await response.json();

        if (!response.ok || !json.success) {
            throw new Error(json.message || 'Failed to save call log.');
        }

        return json;
    }

    return {
        provision,
        saveCallLog
    };
})();
window.WebphoneUi = (() => {
    function setSipStatus(text, className = 'text-secondary') {
        const el = document.getElementById('sipStatus');
        el.className = className;
        el.textContent = text;
    }

    function setAccountName(name) {
        document.getElementById('accountName').textContent = name || 'Not loaded';
    }

    function setCallState(text, stateClass = 'idle') {
        const badge = document.getElementById('callStateBadge');
        badge.textContent = text;
        badge.className = `call-state ${stateClass}`;
    }

    function setProvisioned(isProvisioned) {
        document.getElementById('btnRegister').disabled = !isProvisioned;
    }

    function setRegistered(isRegistered) {
        document.getElementById('btnRegister').disabled = isRegistered;
        document.getElementById('btnUnregister').disabled = !isRegistered;
        document.getElementById('btnCall').disabled = !isRegistered;
    }

    function setIncomingCallMode(enabled) {
        document.getElementById('btnAnswer').disabled = !enabled;
        document.getElementById('btnHangup').disabled = !enabled;
    }

    function setActiveCallMode(enabled) {
        document.getElementById('btnHangup').disabled = !enabled;
        document.getElementById('btnMute').disabled = !enabled;
        document.getElementById('btnHold').disabled = !enabled;
    }

    function resetCallControls(isRegistered) {
        document.getElementById('btnAnswer').disabled = true;
        document.getElementById('btnHangup').disabled = true;
        document.getElementById('btnMute').disabled = true;
        document.getElementById('btnHold').disabled = true;
        document.getElementById('btnCall').disabled = !isRegistered;
    }

    function appendDigit(digit) {
        const input = document.getElementById('dialNumber');
        input.value += digit;
        input.focus();
    }

    function clearNumber() {
        document.getElementById('dialNumber').value = '';
    }

    function getDialNumber() {
        return document.getElementById('dialNumber').value.trim();
    }

    function setDialNumber(value) {
        document.getElementById('dialNumber').value = value || '';
    }

    return {
        setSipStatus,
        setAccountName,
        setCallState,
        setProvisioned,
        setRegistered,
        setIncomingCallMode,
        setActiveCallMode,
        resetCallControls,
        appendDigit,
        clearNumber,
        getDialNumber,
        setDialNumber
    };
})();
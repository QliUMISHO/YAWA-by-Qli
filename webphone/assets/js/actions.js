document.addEventListener('DOMContentLoaded', () => {
    const logger = window.WebphoneLogger;
    const api = window.WebphoneApi;
    const ui = window.WebphoneUi;
    const sip = window.WebphoneSip;

    const extensionSelect = document.getElementById('extensionSelect');

    extensionSelect.value = window.WEBPHONE_CONFIG.defaultExtension || '1001';

    document.getElementById('btnProvision').addEventListener('click', async () => {
        const extension = extensionSelect.value;

        logger.info('PROVISION_START', `Loading extension ${extension}.`);

        try {
            const provision = await api.provision(extension);
            sip.setProvision(provision);
            logger.info('PROVISION_SUCCESS', `Extension ${extension} loaded.`);
        } catch (error) {
            logger.error('PROVISION_FAILED', error.message);
            ui.setSipStatus('Provision Failed', 'text-danger');
        }
    });

    document.getElementById('btnRegister').addEventListener('click', () => {
        sip.register();
    });

    document.getElementById('btnUnregister').addEventListener('click', () => {
        sip.unregister();
    });

    document.getElementById('btnCall').addEventListener('click', () => {
        const number = ui.getDialNumber();
        sip.call(number);
    });

    document.getElementById('btnAnswer').addEventListener('click', () => {
        sip.answer();
    });

    document.getElementById('btnHangup').addEventListener('click', () => {
        sip.hangup();
    });

    document.getElementById('btnMute').addEventListener('click', () => {
        sip.toggleMute();
    });

    document.getElementById('btnHold').addEventListener('click', () => {
        sip.toggleHold();
    });

    document.getElementById('btnClear').addEventListener('click', () => {
        ui.clearNumber();
    });

    document.getElementById('btnClearLogs').addEventListener('click', () => {
        logger.clear();
    });

    document.querySelectorAll('.dial-key').forEach((button) => {
        button.addEventListener('click', () => {
            const digit = button.getAttribute('data-digit');
            ui.appendDigit(digit);
            sip.sendDtmf(digit);
        });
    });

    document.getElementById('dialNumber').addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            const number = ui.getDialNumber();
            sip.call(number);
        }
    });

    logger.info('APP_READY', 'Webphone app loaded.');
});
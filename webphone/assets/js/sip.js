window.WebphoneSip = (() => {
    const logger = window.WebphoneLogger;
    const ui = window.WebphoneUi;

    const state = {
        provision: null,
        ua: null,
        currentSession: null,
        registered: false,
        muted: false,
        held: false,
        callStartedAt: null,
        callAnsweredAt: null,
        direction: null,
        remoteNumber: null
    };

    function setProvision(provision) {
        state.provision = provision;
        logger.setExtension(provision.user.extension);
        ui.setAccountName(`${provision.user.full_name} (${provision.user.extension})`);
        ui.setProvisioned(true);

        logger.info('PROVISION_READY', 'SIP provisioning loaded.', provision.sip);
    }

    function register() {
        if (!state.provision) {
            logger.warn('REGISTER_BLOCKED', 'No provisioning loaded.');
            return;
        }

        if (state.ua) {
            try {
                state.ua.stop();
            } catch (error) {
                logger.warn('UA_STOP_WARNING', error.message);
            }
        }

        const sip = state.provision.sip;
        const socket = new JsSIP.WebSocketInterface(sip.websocket_url);

        state.ua = new JsSIP.UA({
            sockets: [socket],
            uri: sip.uri,
            password: sip.password,
            display_name: sip.display_name,
            session_timers: false,
            register: true,
            register_expires: 300
        });

        bindUaEvents(state.ua);

        logger.info('REGISTER_START', `Registering ${sip.uri} via ${sip.websocket_url}`);
        ui.setSipStatus('Registering', 'text-warning');
        ui.setCallState('Registering', 'ringing');

        state.ua.start();
    }

    function unregister() {
        if (!state.ua) {
            return;
        }

        logger.info('UNREGISTER_START', 'Stopping SIP UA.');

        try {
            state.ua.unregister();
            state.ua.stop();
        } catch (error) {
            logger.error('UNREGISTER_ERROR', error.message);
        }

        state.ua = null;
        state.registered = false;
        ui.setSipStatus('Offline', 'text-secondary');
        ui.setRegistered(false);
        ui.setCallState('Idle', 'idle');
    }

    function call(target) {
        if (!state.ua || !state.registered) {
            logger.warn('CALL_BLOCKED', 'SIP account is not registered.');
            return;
        }

        if (!target) {
            logger.warn('CALL_BLOCKED', 'No target number provided.');
            return;
        }

        const sipDomain = state.provision.sip.domain;
        const destination = `sip:${target}@${sipDomain}`;

        state.direction = 'outbound';
        state.remoteNumber = target;
        state.callStartedAt = new Date();
        state.callAnsweredAt = null;

        logger.info('OUTBOUND_CALL_START', `Calling ${destination}`);

        const eventHandlers = {
            progress: () => {
                logger.info('CALL_PROGRESS', 'Remote side is ringing.');
                ui.setCallState('Ringing', 'ringing');
            },
            failed: (event) => {
                logger.error('CALL_FAILED', getCause(event), event);
                finishCall('failed');
            },
            ended: (event) => {
                logger.info('CALL_ENDED', getCause(event), event);
                finishCall('ended');
            },
            confirmed: () => {
                state.callAnsweredAt = new Date();
                logger.info('CALL_CONFIRMED', 'Call answered.');
                ui.setCallState('In Call', 'active');
                ui.setActiveCallMode(true);
            }
        };

        const options = {
            eventHandlers,
            mediaConstraints: {
                audio: true,
                video: false
            },
            pcConfig: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' }
                ]
            },
            rtcOfferConstraints: {
                offerToReceiveAudio: true,
                offerToReceiveVideo: false
            }
        };

        try {
            state.currentSession = state.ua.call(destination, options);
            bindSessionEvents(state.currentSession);
            ui.setCallState('Calling', 'calling');
            ui.setActiveCallMode(true);
        } catch (error) {
            logger.error('CALL_EXCEPTION', error.message);
            finishCall('failed');
        }
    }

    function answer() {
        if (!state.currentSession) {
            logger.warn('ANSWER_BLOCKED', 'No active incoming session.');
            return;
        }

        logger.info('ANSWER_CALL', 'Answering incoming call.');

        state.callAnsweredAt = new Date();

        state.currentSession.answer({
            mediaConstraints: {
                audio: true,
                video: false
            },
            pcConfig: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' }
                ]
            },
            rtcOfferConstraints: {
                offerToReceiveAudio: true,
                offerToReceiveVideo: false
            }
        });

        ui.setCallState('In Call', 'active');
        ui.setIncomingCallMode(false);
        ui.setActiveCallMode(true);
    }

    function hangup() {
        if (!state.currentSession) {
            return;
        }

        logger.info('HANGUP_CALL', 'Terminating call.');

        try {
            state.currentSession.terminate();
        } catch (error) {
            logger.error('HANGUP_ERROR', error.message);
            finishCall('ended');
        }
    }

    function toggleMute() {
        if (!state.currentSession) {
            return;
        }

        if (state.muted) {
            state.currentSession.unmute({ audio: true });
            state.muted = false;
            document.getElementById('btnMute').innerHTML = '<i class="fas fa-microphone"></i> Mute';
            logger.info('CALL_UNMUTED', 'Microphone unmuted.');
        } else {
            state.currentSession.mute({ audio: true });
            state.muted = true;
            document.getElementById('btnMute').innerHTML = '<i class="fas fa-microphone-slash"></i> Unmute';
            logger.info('CALL_MUTED', 'Microphone muted.');
        }
    }

    function toggleHold() {
        if (!state.currentSession) {
            return;
        }

        if (state.held) {
            state.currentSession.unhold();
            state.held = false;
            document.getElementById('btnHold').innerHTML = '<i class="fas fa-pause"></i> Hold';
            logger.info('CALL_UNHELD', 'Call resumed.');
        } else {
            state.currentSession.hold();
            state.held = true;
            document.getElementById('btnHold').innerHTML = '<i class="fas fa-play"></i> Resume';
            logger.info('CALL_HELD', 'Call placed on hold.');
        }
    }

    function sendDtmf(digit) {
        if (!state.currentSession || !state.currentSession.isEstablished()) {
            return;
        }

        try {
            state.currentSession.sendDTMF(digit);
            logger.debug('DTMF_SENT', `Sent DTMF: ${digit}`);
        } catch (error) {
            logger.error('DTMF_ERROR', error.message);
        }
    }

    function bindUaEvents(ua) {
        ua.on('connecting', () => {
            logger.info('UA_CONNECTING', 'Connecting to WebSocket.');
            ui.setSipStatus('Connecting', 'text-warning');
        });

        ua.on('connected', () => {
            logger.info('UA_CONNECTED', 'WebSocket connected.');
            ui.setSipStatus('Connected', 'text-info');
        });

        ua.on('disconnected', (event) => {
            logger.warn('UA_DISCONNECTED', 'WebSocket disconnected.', event);
            state.registered = false;
            ui.setSipStatus('Disconnected', 'text-danger');
            ui.setRegistered(false);
            ui.setCallState('Disconnected', 'failed');
        });

        ua.on('registered', () => {
            logger.info('UA_REGISTERED', 'SIP account registered.');
            state.registered = true;
            ui.setSipStatus('Registered', 'text-success');
            ui.setRegistered(true);
            ui.setCallState('Registered', 'registered');
        });

        ua.on('unregistered', () => {
            logger.warn('UA_UNREGISTERED', 'SIP account unregistered.');
            state.registered = false;
            ui.setSipStatus('Unregistered', 'text-secondary');
            ui.setRegistered(false);
            ui.setCallState('Idle', 'idle');
        });

        ua.on('registrationFailed', (event) => {
            logger.error('UA_REGISTRATION_FAILED', getCause(event), event);
            state.registered = false;
            ui.setSipStatus('Registration Failed', 'text-danger');
            ui.setRegistered(false);
            ui.setCallState('Registration Failed', 'failed');
        });

        ua.on('newRTCSession', (event) => {
            const session = event.session;

            if (state.currentSession) {
                logger.warn('INCOMING_BUSY', 'Rejecting call because another session exists.');
                session.terminate({
                    status_code: 486,
                    reason_phrase: 'Busy Here'
                });
                return;
            }

            state.currentSession = session;
            bindSessionEvents(session);

            if (event.originator === 'remote') {
                state.direction = 'inbound';
                state.callStartedAt = new Date();
                state.callAnsweredAt = null;

                const remoteIdentity = session.remote_identity;
                state.remoteNumber = remoteIdentity?.uri?.user || 'unknown';

                logger.info('INCOMING_CALL', `Incoming call from ${state.remoteNumber}`, {
                    from: remoteIdentity?.toString?.()
                });

                ui.setDialNumber(state.remoteNumber);
                ui.setCallState('Incoming', 'ringing');
                ui.setIncomingCallMode(true);
            }
        });
    }

    function bindSessionEvents(session) {
        session.connection?.addEventListener?.('track', (event) => {
            const remoteAudio = document.getElementById('remoteAudio');
            if (remoteAudio && event.streams && event.streams[0]) {
                remoteAudio.srcObject = event.streams[0];
                remoteAudio.play().catch((error) => {
                    logger.warn('REMOTE_AUDIO_PLAY_WARNING', error.message);
                });
            }
        });

        session.on('peerconnection', () => {
            logger.debug('SESSION_PEERCONNECTION', 'Peer connection created.');
        });

        session.on('connecting', () => {
            logger.info('SESSION_CONNECTING', 'Session connecting.');
        });

        session.on('sending', () => {
            logger.debug('SESSION_SENDING', 'Sending SIP INVITE.');
        });

        session.on('progress', () => {
            logger.info('SESSION_PROGRESS', 'Call progress.');
        });

        session.on('accepted', () => {
            logger.info('SESSION_ACCEPTED', 'Call accepted.');
        });

        session.on('confirmed', () => {
            state.callAnsweredAt = state.callAnsweredAt || new Date();
            logger.info('SESSION_CONFIRMED', 'Call confirmed.');
            ui.setCallState('In Call', 'active');
            ui.setActiveCallMode(true);
        });

        session.on('ended', (event) => {
            logger.info('SESSION_ENDED', getCause(event), event);
            finishCall('ended');
        });

        session.on('failed', (event) => {
            logger.error('SESSION_FAILED', getCause(event), event);
            finishCall('failed');
        });

        session.on('hold', () => {
            logger.info('SESSION_HOLD', 'Call hold event received.');
        });

        session.on('unhold', () => {
            logger.info('SESSION_UNHOLD', 'Call unhold event received.');
        });

        session.on('muted', () => {
            logger.info('SESSION_MUTED', 'Call muted event received.');
        });

        session.on('unmuted', () => {
            logger.info('SESSION_UNMUTED', 'Call unmuted event received.');
        });
    }

    async function finishCall(status) {
        const session = state.currentSession;
        const endedAt = new Date();

        const startedAt = state.callStartedAt;
        const answeredAt = state.callAnsweredAt;

        const durationSeconds = answeredAt
            ? Math.max(0, Math.floor((endedAt.getTime() - answeredAt.getTime()) / 1000))
            : 0;

        const extension = state.provision?.user?.extension || '';

        const payload = {
            extension,
            direction: state.direction || 'outbound',
            remote_number: state.remoteNumber || '',
            call_status: status,
            sip_call_id: getSipCallId(session),
            started_at: toMysqlDateTime(startedAt),
            answered_at: toMysqlDateTime(answeredAt),
            ended_at: toMysqlDateTime(endedAt),
            duration_seconds: durationSeconds
        };

        if (extension && payload.remote_number) {
            try {
                await window.WebphoneApi.saveCallLog(payload);
                logger.info('CALL_LOG_SAVED', 'Call log saved.', payload);
            } catch (error) {
                logger.error('CALL_LOG_SAVE_FAILED', error.message, payload);
            }
        }

        state.currentSession = null;
        state.muted = false;
        state.held = false;
        state.callStartedAt = null;
        state.callAnsweredAt = null;
        state.direction = null;
        state.remoteNumber = null;

        document.getElementById('btnMute').innerHTML = '<i class="fas fa-microphone"></i> Mute';
        document.getElementById('btnHold').innerHTML = '<i class="fas fa-pause"></i> Hold';

        ui.resetCallControls(state.registered);
        ui.setCallState(state.registered ? 'Registered' : 'Idle', state.registered ? 'registered' : 'idle');
    }

    function getCause(event) {
        return event?.cause || event?.reason_phrase || event?.message || 'Unknown cause';
    }

    function getSipCallId(session) {
        try {
            return session?._request?.call_id || session?._dialog?.id?.call_id || '';
        } catch (error) {
            return '';
        }
    }

    function toMysqlDateTime(date) {
        if (!date) {
            return null;
        }

        const pad = (num) => String(num).padStart(2, '0');

        return [
            date.getFullYear(),
            '-',
            pad(date.getMonth() + 1),
            '-',
            pad(date.getDate()),
            ' ',
            pad(date.getHours()),
            ':',
            pad(date.getMinutes()),
            ':',
            pad(date.getSeconds())
        ].join('');
    }

    return {
        setProvision,
        register,
        unregister,
        call,
        answer,
        hangup,
        toggleMute,
        toggleHold,
        sendDtmf
    };
})();
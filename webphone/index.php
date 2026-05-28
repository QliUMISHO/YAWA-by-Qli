<?php
declare(strict_types=1);

date_default_timezone_set('Asia/Manila');
?>
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>YAWA-BY-QLI Webphone</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.2/dist/css/bootstrap.min.css"
    >

    <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@5.15.4/css/all.min.css"
    >

    <link rel="stylesheet" href="assets/css/webphone.css">
</head>
<body>
<div class="app-shell">
    <aside class="side-panel">
        <div class="brand-box">
            <div class="brand-icon">
                <i class="fas fa-phone-alt"></i>
            </div>
            <div>
                <div class="brand-title">YAWA-BY-QLI</div>
                <div class="brand-subtitle">WebRTC Webphone</div>
            </div>
        </div>

        <div class="account-card">
            <div class="label">Extension</div>
            <select id="extensionSelect" class="form-control form-control-sm">
                <option value="1001">1001 - Webphone 1001</option>
                <option value="1002">1002 - Webphone 1002</option>
                <option value="1003">1003 - Webphone 1003</option>
            </select>

            <button id="btnProvision" class="btn btn-sm btn-primary btn-block mt-2">
                <i class="fas fa-sync-alt"></i> Load Account
            </button>
        </div>

        <div class="status-card">
            <div class="status-row">
                <span>Account</span>
                <strong id="accountName">Not loaded</strong>
            </div>
            <div class="status-row">
                <span>SIP</span>
                <strong id="sipStatus" class="text-secondary">Offline</strong>
            </div>
            <div class="status-row">
                <span>PBX</span>
                <strong>10.201.0.254</strong>
            </div>
            <div class="status-row">
                <span>WSS</span>
                <strong>8089</strong>
            </div>
        </div>

        <div class="side-actions">
            <button id="btnRegister" class="btn btn-success btn-sm btn-block" disabled>
                <i class="fas fa-plug"></i> Register
            </button>
            <button id="btnUnregister" class="btn btn-outline-danger btn-sm btn-block" disabled>
                <i class="fas fa-power-off"></i> Unregister
            </button>
        </div>
    </aside>

    <main class="main-panel">
        <section class="call-card">
            <div class="call-header">
                <div>
                    <h1>Webphone</h1>
                    <p>Development MVP for SIP over WSS using Asterisk + JsSIP.</p>
                </div>
                <div id="callStateBadge" class="call-state idle">Idle</div>
            </div>

            <div class="number-display">
                <input
                    id="dialNumber"
                    type="text"
                    class="form-control"
                    placeholder="Dial extension or number"
                    autocomplete="off"
                >
            </div>

            <div class="dialpad">
                <button class="dial-key" data-digit="1">1</button>
                <button class="dial-key" data-digit="2">2<span>ABC</span></button>
                <button class="dial-key" data-digit="3">3<span>DEF</span></button>

                <button class="dial-key" data-digit="4">4<span>GHI</span></button>
                <button class="dial-key" data-digit="5">5<span>JKL</span></button>
                <button class="dial-key" data-digit="6">6<span>MNO</span></button>

                <button class="dial-key" data-digit="7">7<span>PQRS</span></button>
                <button class="dial-key" data-digit="8">8<span>TUV</span></button>
                <button class="dial-key" data-digit="9">9<span>WXYZ</span></button>

                <button class="dial-key" data-digit="*">*</button>
                <button class="dial-key" data-digit="0">0<span>+</span></button>
                <button class="dial-key" data-digit="#">#</button>
            </div>

            <div class="call-actions">
                <button id="btnCall" class="btn btn-call" disabled>
                    <i class="fas fa-phone"></i>
                </button>
                <button id="btnAnswer" class="btn btn-answer" disabled>
                    <i class="fas fa-phone-volume"></i>
                </button>
                <button id="btnHangup" class="btn btn-hangup" disabled>
                    <i class="fas fa-phone-slash"></i>
                </button>
            </div>

            <div class="secondary-actions">
                <button id="btnMute" class="btn btn-outline-light" disabled>
                    <i class="fas fa-microphone"></i> Mute
                </button>
                <button id="btnHold" class="btn btn-outline-light" disabled>
                    <i class="fas fa-pause"></i> Hold
                </button>
                <button id="btnClear" class="btn btn-outline-light">
                    <i class="fas fa-backspace"></i> Clear
                </button>
            </div>

            <audio id="remoteAudio" autoplay playsinline></audio>
        </section>

        <section class="log-card">
            <div class="log-header">
                <h2>Developer Logs</h2>
                <button id="btnClearLogs" class="btn btn-sm btn-outline-light">
                    Clear
                </button>
            </div>
            <div id="logBox" class="log-box"></div>
        </section>
    </main>
</div>

<script src="https://cdn.jsdelivr.net/npm/jssip@3.10.1/dist/jssip.min.js"></script>

<script src="assets/js/config.js"></script>
<script src="assets/js/logs.js"></script>
<script src="assets/js/api.js"></script>
<script src="assets/js/ui.js"></script>
<script src="assets/js/sip.js"></script>
<script src="assets/js/actions.js"></script>
</body>
</html>
# YAWA-BY-QLI WebRTC Webphone

Development baseline for a web-based WebRTC SIP webphone using:

- Asterisk
- PJSIP
- WSS
- DTLS-SRTP
- JsSIP
- PHP
- MySQL / MariaDB

## Development Server

- Ubuntu Server IP: `10.201.0.254`
- phpMyAdmin: `http://10.201.0.254/phpmyadmin`
- Webphone URL: `http://10.201.0.254/YAWA-BY-QLI/webphone/`
- Asterisk WSS URL: `wss://10.201.0.254:8089/ws`

## Test Extensions

| Extension | Password |
|---|---|
| 1001 | StrongPass1001 |
| 1002 | StrongPass1002 |
| 1003 | StrongPass1003 |

## Asterisk Test Extensions

| Extension | Purpose |
|---|---|
| 600 | Playback audio test |
| 601 | Echo test |

## Initial Setup

Import database:

```bash
mysql -u root -p < database/schema.sql
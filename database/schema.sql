CREATE DATABASE IF NOT EXISTS yawa_webphone
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE yawa_webphone;

CREATE TABLE IF NOT EXISTS webphone_users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    extension VARCHAR(20) NOT NULL UNIQUE,
    sip_username VARCHAR(80) NOT NULL UNIQUE,
    sip_password VARCHAR(255) NOT NULL,
    sip_domain VARCHAR(150) NOT NULL DEFAULT '10.201.0.254',
    websocket_url VARCHAR(255) NOT NULL DEFAULT 'wss://10.201.0.254:8089/ws',
    status TINYINT UNSIGNED NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS webphone_call_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    extension VARCHAR(20) NOT NULL,
    direction ENUM('inbound','outbound') NOT NULL,
    remote_number VARCHAR(80) NOT NULL,
    call_status VARCHAR(80) NOT NULL,
    sip_call_id VARCHAR(255) NULL,
    started_at DATETIME NULL,
    answered_at DATETIME NULL,
    ended_at DATETIME NULL,
    duration_seconds INT UNSIGNED NOT NULL DEFAULT 0,
    raw_payload JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_extension (extension),
    INDEX idx_remote_number (remote_number),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS webphone_client_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    extension VARCHAR(20) NULL,
    level VARCHAR(30) NOT NULL DEFAULT 'info',
    event_name VARCHAR(120) NOT NULL,
    message TEXT NULL,
    raw_payload JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_extension (extension),
    INDEX idx_level (level),
    INDEX idx_event_name (event_name),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO webphone_users
(full_name, extension, sip_username, sip_password, sip_domain, websocket_url, status)
VALUES
('Webphone 1001', '1001', '1001', 'StrongPass1001', '10.201.0.254', 'wss://10.201.0.254:8089/ws', 1),
('Webphone 1002', '1002', '1002', 'StrongPass1002', '10.201.0.254', 'wss://10.201.0.254:8089/ws', 1),
('Webphone 1003', '1003', '1003', 'StrongPass1003', '10.201.0.254', 'wss://10.201.0.254:8089/ws', 1)
ON DUPLICATE KEY UPDATE
    full_name = VALUES(full_name),
    sip_password = VALUES(sip_password),
    sip_domain = VALUES(sip_domain),
    websocket_url = VALUES(websocket_url),
    status = VALUES(status);
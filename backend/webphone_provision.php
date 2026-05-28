<?php
declare(strict_types=1);

require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

function respond(array $payload, int $status = 200): never
{
    http_response_code($status);
    echo json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    exit;
}

$extension = trim((string)($_GET['extension'] ?? ''));

if ($extension === '') {
    respond([
        'success' => false,
        'message' => 'Missing extension.',
    ], 400);
}

try {
    $conn = db();

    $stmt = $conn->prepare("
        SELECT 
            id,
            full_name,
            extension,
            sip_username,
            sip_password,
            sip_domain,
            websocket_url,
            status
        FROM webphone_users
        WHERE extension = ?
        LIMIT 1
    ");
    $stmt->bind_param('s', $extension);
    $stmt->execute();

    $result = $stmt->get_result();
    $user = $result->fetch_assoc();

    if (!$user) {
        respond([
            'success' => false,
            'message' => 'Extension not found.',
        ], 404);
    }

    if ((int)$user['status'] !== 1) {
        respond([
            'success' => false,
            'message' => 'Extension is inactive.',
        ], 403);
    }

    respond([
        'success' => true,
        'server' => [
            'ip' => '10.201.0.254',
            'phpmyadmin' => 'http://10.201.0.254/phpmyadmin',
        ],
        'user' => [
            'id' => (int)$user['id'],
            'full_name' => $user['full_name'],
            'extension' => $user['extension'],
        ],
        'sip' => [
            'extension' => $user['extension'],
            'username' => $user['sip_username'],
            'password' => $user['sip_password'],
            'domain' => $user['sip_domain'],
            'uri' => 'sip:' . $user['sip_username'] . '@' . $user['sip_domain'],
            'websocket_url' => $user['websocket_url'],
            'display_name' => $user['full_name'],
        ],
        'features' => [
            'voice' => true,
            'video' => false,
            'mute' => true,
            'hold' => true,
            'dtmf' => true,
            'transfer' => false,
        ],
    ]);
} catch (Throwable $e) {
    respond([
        'success' => false,
        'message' => 'Provisioning failed.',
        'error' => $e->getMessage(),
    ], 500);
}
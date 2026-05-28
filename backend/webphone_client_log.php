<?php
declare(strict_types=1);

require_once __DIR__ . '/db.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function respond(array $payload, int $status = 200): never
{
    http_response_code($status);
    echo json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw ?: '{}', true);

if (!is_array($data)) {
    respond([
        'success' => false,
        'message' => 'Invalid JSON payload.',
    ], 400);
}

$extension = trim((string)($data['extension'] ?? ''));
$level = trim((string)($data['level'] ?? 'info'));
$eventName = trim((string)($data['event_name'] ?? 'unknown'));
$message = trim((string)($data['message'] ?? ''));

if ($eventName === '') {
    $eventName = 'unknown';
}

$allowedLevels = ['debug', 'info', 'warn', 'error'];
if (!in_array($level, $allowedLevels, true)) {
    $level = 'info';
}

try {
    $conn = db();

    $rawPayload = json_encode($data, JSON_UNESCAPED_SLASHES);

    $stmt = $conn->prepare("
        INSERT INTO webphone_client_logs
        (
            extension,
            level,
            event_name,
            message,
            raw_payload
        )
        VALUES (?, ?, ?, ?, CAST(? AS JSON))
    ");

    $stmt->bind_param(
        'sssss',
        $extension,
        $level,
        $eventName,
        $message,
        $rawPayload
    );

    $stmt->execute();

    respond([
        'success' => true,
        'message' => 'Client log saved.',
        'id' => $conn->insert_id,
    ]);
} catch (Throwable $e) {
    respond([
        'success' => false,
        'message' => 'Failed to save client log.',
        'error' => $e->getMessage(),
    ], 500);
}
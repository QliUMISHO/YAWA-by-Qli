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
$direction = trim((string)($data['direction'] ?? ''));
$remoteNumber = trim((string)($data['remote_number'] ?? ''));
$callStatus = trim((string)($data['call_status'] ?? ''));
$sipCallId = trim((string)($data['sip_call_id'] ?? ''));

$startedAt = $data['started_at'] ?? null;
$answeredAt = $data['answered_at'] ?? null;
$endedAt = $data['ended_at'] ?? null;
$durationSeconds = (int)($data['duration_seconds'] ?? 0);

if ($extension === '' || $direction === '' || $remoteNumber === '' || $callStatus === '') {
    respond([
        'success' => false,
        'message' => 'Missing required call log fields.',
    ], 400);
}

if (!in_array($direction, ['inbound', 'outbound'], true)) {
    respond([
        'success' => false,
        'message' => 'Invalid call direction.',
    ], 400);
}

try {
    $conn = db();

    $rawPayload = json_encode($data, JSON_UNESCAPED_SLASHES);

    $stmt = $conn->prepare("
        INSERT INTO webphone_call_logs
        (
            extension,
            direction,
            remote_number,
            call_status,
            sip_call_id,
            started_at,
            answered_at,
            ended_at,
            duration_seconds,
            raw_payload
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CAST(? AS JSON))
    ");

    $stmt->bind_param(
        'ssssssssis',
        $extension,
        $direction,
        $remoteNumber,
        $callStatus,
        $sipCallId,
        $startedAt,
        $answeredAt,
        $endedAt,
        $durationSeconds,
        $rawPayload
    );

    $stmt->execute();

    respond([
        'success' => true,
        'message' => 'Call log saved.',
        'id' => $conn->insert_id,
    ]);
} catch (Throwable $e) {
    respond([
        'success' => false,
        'message' => 'Failed to save call log.',
        'error' => $e->getMessage(),
    ], 500);
}
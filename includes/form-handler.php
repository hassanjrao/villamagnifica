<?php
declare(strict_types=1);

function handleVillaForm(bool $booking, bool $smtp = false, string $contactRecipient = 'alexlluch3@gmail.com', bool $phoneRequired = true, string $contactReturnPath = 'index.html#section10'): never
{
    $labels = $booking
        ? ['fname'=>'First name','lname'=>'Last name','email'=>'Email address','about'=>'About you','occasion'=>'Occasion or event','fdate'=>'Arrival date','ldate'=>'Departure date','people'=>'Number of guests','hearabout'=>'How you heard about the villa','message'=>'Message']
        : ['fname'=>'First name','lname'=>'Last name','email'=>'Email address','phone_number'=>'Phone number','message'=>'Message'];
    $fields = []; $errors = [];
    foreach (array_merge(array_keys($labels), ['reason']) as $name) {
        $raw = $_POST[$name] ?? '';
        $fields[$name] = is_string($raw) ? trim($raw) : '';
        if (isset($labels[$name]) && ($name !== 'phone_number' || $phoneRequired) && $fields[$name] === '') $errors[$name] = $labels[$name] . ' is required.';
        elseif (strlen($fields[$name]) > 10000) $errors[$name] = ($labels[$name] ?? 'This field') . ' is too long.';
    }
    if ($fields['email'] !== '' && !filter_var($fields['email'], FILTER_VALIDATE_EMAIL)) $errors['email'] = 'Enter a valid email address.';
    if ($booking) {
        foreach (['fdate','ldate'] as $name) {
            $date = DateTimeImmutable::createFromFormat('!Y-m-d', $fields[$name]);
            if ($fields[$name] !== '' && (!$date || $date->format('Y-m-d') !== $fields[$name])) $errors[$name] = 'Enter a valid ' . strtolower($labels[$name]) . '.';
        }
        if (!isset($errors['fdate']) && !isset($errors['ldate']) && $fields['fdate'] !== '' && $fields['ldate'] !== '' && $fields['ldate'] < $fields['fdate']) $errors['ldate'] = 'Departure date must be on or after the arrival date.';
        if ($fields['people'] !== '' && (!ctype_digit($fields['people']) || (int)$fields['people'] < 1 || (int)$fields['people'] > 24)) $errors['people'] = 'Enter a number of guests between 1 and 24.';
    }
    $json = str_contains($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json');
    $sendResponse = static function(int $code, array $result) use ($json, $booking, $contactReturnPath): never {
        http_response_code($code); header('Cache-Control: no-store');
        if ($json) { header('Content-Type: application/json; charset=utf-8'); echo json_encode($result); exit; }
        header('Content-Type: text/html; charset=utf-8');
        $escape = static fn(string $text): string => htmlspecialchars($text, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
        echo '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Villa Magnifica — form result</title></head><body><main><h1>Villa Magnifica — form result</h1><p>'.$escape($result['message']).'</p>';
        if (isset($result['errors'])) { echo '<ul>'; foreach ($result['errors'] as $error) echo '<li>'.$escape($error).'</li>'; echo '</ul>'; }
        echo '<p>Use your browser’s Back button to return to your entries, or <a href="'.$escape($booking?'book-now.html':$contactReturnPath).'">return to the form</a>.</p></main></body></html>'; exit;
    };
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') $sendResponse(405, ['message'=>'Please submit the contact or booking form.']);
    if ($errors) $sendResponse(422, ['message'=>'Please correct the highlighted fields.', 'errors'=>$errors]);
    $escape = static fn(string $text): string => htmlspecialchars($text, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    $to = $booking ? 'alexlluch3@gmail.com' : $contactRecipient;
    $subject = ($booking ? 'Booking' : 'Contact') . ' Request Submitted - ' . $fields['email'];
    $htmlContent = '<h2>Villa Magnifica '.($booking?'booking':'contact').' request</h2><table>';
    foreach ($fields as $name=>$value) if ($value !== '') $htmlContent .= '<tr><th>'.$escape($labels[$name] ?? 'How you heard about the villa').'</th><td>'.nl2br($escape($value)).'</td></tr>';
    $htmlContent .= '</table>'; $delivered = false;
    try {
        // The fixture is selected by a local environment variable, never request data.
        $fixture = getenv('VILLA_FORM_TEST_HANDLER');
        if ($fixture) $delivered = (bool) require $fixture;
        elseif ($smtp) {
            $private = getenv('VILLA_SMTP_HANDLER');
            // Resolve relative to the production account home, outside its web root.
            if (!getenv('VILLA_SMTP_HANDLER')) $private = dirname(__DIR__, 2) . '/.villamagnifica-contact.php';
            if (!is_file($private)) throw new RuntimeException('Mail configuration is unavailable');
            $before = ob_get_level(); ob_start();
            try { require $private; $delivered = trim((string)ob_get_contents()) === 'ok'; }
            finally { while (ob_get_level() > $before) ob_end_clean(); }
        } else {
            $headers = "MIME-Version: 1.0\r\nContent-type:text/html;charset=UTF-8\r\n";
            if ($booking && in_array($fields['hearabout'], ['Lake Oak Meadows','Vitaglianno Winery'], true)) $headers .= "Cc: anthony@lakeoakmeadows.com\r\n";
            $delivered = mail($to, $subject, $htmlContent, $headers);
        }
    } catch (Throwable $error) { error_log('Villa Magnifica form delivery failed: '.get_class($error)); }
    $sendResponse($delivered ? 200 : 503, ['message'=>$delivered ? 'Thanks for contacting us. We will get back to you soon.' : 'Your message could not be sent. Please try again. Your entries have been kept.']);
}

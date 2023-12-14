let body = $response.body;
// change type to number
body = body.replace(/type="password"/g, 'type="number"');
$done({ body });

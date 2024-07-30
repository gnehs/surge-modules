let body = $response.body;
if (body) {
  // change type to number
  body = body.replace(/type="password"/g, 'type="number"');
  body = body.replace(/autocomplete="off"/g, 'autocomplete="one-time-code"');
}
$done({ body });

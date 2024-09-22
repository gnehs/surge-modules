let body = $response.body;
if (body) {
  // change type to number
  body = body.replace(/type="password"/g, 'type="text"');
  body = body.replace(/autocomplete="off"/g, 'autocomplete="one-time-code"');
}
$done({ body });

async function editResponse() {
  let body = $response.body;
  // change type to number
  body = body.replace(/type="password"/g, 'type="number"');
  $done({ body });
}

(async () => {
  console.log("ℹ️ 信用卡 3D 驗證自動填寫修正 v20231215.1");
  try {
    if (isManualRun(true, false)) {
      throw "請勿手動執行此腳本";
    }
    await editResponse();
  } catch (error) {
    handleError(error);
  }
  $done({});
})();

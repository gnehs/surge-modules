import * as flatbuffers from "flatbuffers";
import WeatherKit2 from "./class/WeatherKit2.mjs";
try {
  const url = new URL($request.url);
  console.log(`⚠ url: ${url.toJSON()}`, "");
  // 獲取連接參數
  const METHOD = $request.method,
    HOST = url.hostname,
    PATH = url.pathname,
    PATHs = url.pathname.split("/").filter(Boolean);
  // 解析格式
  const FORMAT = (
    $response.headers?.["Content-Type"] ?? $response.headers?.["content-type"]
  )?.split(";")?.[0];
  console.log(
    `⚠ METHOD: ${METHOD}, HOST: ${HOST}, PATH: ${PATH}, PATHs: ${PATHs}, FORMAT: ${FORMAT}`
  );
  if (FORMAT === "application/json" || FORMAT === "text/json") {
    body = JSON.parse($response.body ?? "{}");
    console.log(body);
    $done({ body: JSON.stringify(body) });

    // 路徑判斷
    // if (PATH.startsWith("/api/v1/availability/")) {
    //   body = Configs?.Availability?.v2;
    // }
  } else if (FORMAT === "application/vnd.apple.flatbuffer") {
    const ByteBuffer = new flatbuffers.ByteBuffer($response.body);
    const Builder = new flatbuffers.Builder();

    let body = WeatherKit2.decode(ByteBuffer, "all");
    console.log(body);
    const WeatherData = WeatherKit2.encode(Builder, "all", body);
    Builder.finish(WeatherData);

    let rawBody = Builder.asUint8Array(); // Of type `Uint8Array`.
    $done({
      body: rawBody,
    });
  } else {
    $done($response);
  }
} catch (e) {
  console.log("執行時發生錯誤", e);
} finally {
  $done($response);
}

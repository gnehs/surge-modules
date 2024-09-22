import * as flatbuffers from "flatbuffers";
import WeatherKit2 from "./class/WeatherKit2.mjs";
import { Configs } from "./Weather.json";
function parseWeatherKitURL(url = new URL($request.url)) {
  console.log("☑️ parseWeatherKitURL");

  const regex =
    /^\/api\/(?<version>v1|v2|v3)\/(availability|weather)\/(?<language>\w+)(?:-\w+)?(-(?<country>[A-Z]{2}))?\/(?<latitude>-?\d+\.?\d*)\/(?<longitude>-?\d+\.?\d*)$/i;
  const match = url?.pathname.match(regex);

  if (!match) {
    console.log("❌ parseWeatherKitURL: No match found");
    return null;
  }

  const { version, language, latitude, longitude, country } = match.groups;

  const result = {
    version,
    language,
    latitude,
    longitude,
    country: country || url?.searchParams?.get("country"),
  };

  console.log("✅ parseWeatherKitURL", JSON.stringify(result, null, 2));

  return result;
}
(async () => {
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
      if (PATH.startsWith("/api/v1/availability/")) {
        body = JSON.parse($response.body ?? "{}");
        $done({ body: JSON.stringify(Configs?.Availability?.v2 ?? body) });
      }
    } else if (FORMAT === "application/vnd.apple.flatbuffer") {
      // url data
      const urlInfo = parseWeatherKitURL();
      const ByteBuffer = new flatbuffers.ByteBuffer($response.body);
      const Builder = new flatbuffers.Builder();

      let body = WeatherKit2.decode(ByteBuffer, "all");
      //console.log(body);
      if (url.searchParams.get("dataSets").includes("forecastNextHour")) {
        if (!body?.forecastNextHour && urlInfo.country === "TW") {
          console.log(`⚠ 自動填充短時降雨資料`);
          body = await InjectForecastNextHour(body);
        }
      }

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
    console.log("執行時發生錯誤");
    console.log(e.toString());
  } finally {
    $done($response);
  }
})();
async function InjectForecastNextHour(body) {
  const urlInfo = parseWeatherKitURL();
  const { latitude, longitude } = urlInfo;
  let kneadWeatherRainResult = await new Promise((resolve, reject) => {
    console.log(`⚠ 自動填充短時降雨資料 - 正在請求`);
    $httpClient.get(
      {
        url: `https://weather-api.pancake.tw/rain-forcast?lat=${latitude}&lon=${longitude}`,
        headers: {
          "Content-Type": "application/json",
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
        },
      },
      function (error, response, data) {
        if (error) {
          $notification.post("WeatherKit", "", "連線錯誤‼️");
          reject(error);
        } else if (response.status === 200) {
          resolve(JSON.parse(data));
        }
      }
    );
  });
  console.log(`⚠ 自動填充短時降雨資料 - 完成請求`);
  kneadWeatherRainResult.data = kneadWeatherRainResult.data.sort(
    (a, b) =>
      new Date(a.forcastTime).getTime() - new Date(b.forcastTime).getTime()
  );
  console.log(`⚠ 自動填充短時降雨資料 - 開始填充`);
  const timeStamp = Date.now() / 1000;
  const minuteStemp =
    new Date(kneadWeatherRainResult.basetime).getTime() / 1000;
  // 計算分鐘間隔
  const calculateMinuteInterval = (data) => {
    if (data.length < 2) return 60; // 預設分鐘間隔 60 秒
    const firstTime = new Date(data[0].forcastTime).getTime();
    const secondTime = new Date(data[1].forcastTime).getTime();
    return Math.abs((secondTime - firstTime) / 1000 / 60); // 以分鐘為單位
  };

  const minuteInterval = calculateMinuteInterval(kneadWeatherRainResult.data);

  console.log(`⚠ 自動填充短時降雨資料 - 計算分鐘間隔 - ${minuteInterval}`);
  let forecastNextHour = {
    metadata: {
      attributionUrl:
        "https://developer.apple.com/weatherkit/data-source-attribution-internal/",
      expireTime: timeStamp + 60 * 60,
      language: null,
      latitude,
      longitude,
      providerLogo: null,
      providerName:
        kneadWeatherRainResult.source === "jma"
          ? "日本氣象廳"
          : "國家災害防救科技中心",
      readTime: timeStamp,
      reportedTime: minuteStemp,
      temporarilyUnavailable: false,
      sourceType: "MODELED",
    },
    condition: [],
    forecastEnd: 0,
    forecastStart: minuteStemp,
    minutes: kneadWeatherRainResult.data
      .map((minuteData) => {
        const minute = {
          perceivedPrecipitationIntensity: 0,
          precipitationChance: 0,
          precipitationIntensity: parseFloat(minuteData.value),
          startTime: new Date(minuteData.forcastTime).getTime() / 1000,
        };
        let minutes = [
          { ...minute },
          { ...minute },
          { ...minute },
          { ...minute },
          { ...minute },
        ];
        minutes = minutes.map((minute, idx) => {
          // 根據偵測到的分鐘精度來填充時間
          minute.startTime = minute.startTime + idx * minuteInterval * 60;
          return minute;
        });
        return minutes;
      })
      .flat(Infinity),
    summary: [],
  };
  console.log(`⚠ 自動填充短時降雨資料 - 完成`);
  body.forecastNextHour = forecastNextHour;
  return body;
}

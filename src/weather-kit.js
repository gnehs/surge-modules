let body = $response.body;
import * as flatbuffers from "flatbuffers";
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

const url = new URL($request.url);
log(`⚠ url: ${url.toJSON()}`, "");
// 获取连接参数
const METHOD = $request.method,
  HOST = url.hostname,
  PATH = url.pathname,
  PATHs = url.pathname.split("/").filter(Boolean);
log(`⚠ METHOD: ${METHOD}, HOST: ${HOST}, PATH: ${PATH}, PATHs: ${PATHs}`, "");
// 解析格式
const FORMAT = (
  $response.headers?.["Content-Type"] ?? $response.headers?.["content-type"]
)?.split(";")?.[0];
!(async () => {
  const { Settings, Caches, Configs } = setENV(
    "iRingo",
    "WeatherKit",
    Database
  );
  log(`⚠ Settings.Switch: ${Settings?.Switch}`, "");
  switch (Settings.Switch) {
    case true:
    default:
      // 创建空数据
      let body = {};
      // 格式判断
      switch (FORMAT) {
        case undefined: // 视为无body
        case "application/x-www-form-urlencoded":
        case "text/plain":
        case "application/x-mpegURL":
        case "application/x-mpegurl":
        case "application/vnd.apple.mpegurl":
        case "audio/mpegurl":
        case "text/xml":
        case "text/html":
        case "text/plist":
        case "application/xml":
        case "application/plist":
        case "application/x-plist":
        case "text/vtt":
        case "application/vtt":
          break;
        case "text/json":
        case "application/json":
          body = JSON.parse($response.body ?? "{}");
          switch (HOST) {
            case "weatherkit.apple.com":
              // 路径判断
              // if (PATH.startsWith("/api/v1/availability/")) {
              //   body = Configs?.Availability?.v2;
              // }
              break;
          }
          $response.body = JSON.stringify(body);
          break;
        case "application/vnd.apple.flatbuffer":
        case "application/protobuf":
        case "application/x-protobuf":
        case "application/vnd.google.protobuf":
        case "application/grpc":
        case "application/grpc+proto":
        case "application/octet-stream":
          let rawBody = $response.body ?? new Uint8Array();
          switch (FORMAT) {
            case "application/vnd.apple.flatbuffer":
              // 解析FlatBuffer
              const ByteBuffer = new flatbuffers.ByteBuffer(rawBody);
              const Builder = new flatbuffers.Builder();
              if (PATH.startsWith("/api/v2/weather/")) {
                body = WeatherKit2.decode(ByteBuffer, "all");
                console.log(body);
                const WeatherData = WeatherKit2.encode(Builder, "all", body);
                Builder.finish(WeatherData);
              }
              // 路径判断
              // if (PATH.startsWith("/api/v2/weather/")) {
              //   body = WeatherKit2.decode(ByteBuffer, "all");
              //   console.log(body);
              //   if (url.searchParams.get("dataSets").includes("airQuality")) {
              //     // InjectAirQuality
              //     if (
              //       Settings?.AQI?.ReplaceProviders?.includes(
              //         body?.airQuality?.metadata?.providerName
              //       )
              //     )
              //       body = await InjectAirQuality(url, body, Settings);
              //     // PollutantUnitConverter
              //     switch (
              //       body?.airQuality?.metadata?.providerName?.split("\n")?.[0]
              //     ) {
              //       case "和风天气":
              //       case "QWeather":
              //         if (body?.airQuality?.pollutants)
              //           body.airQuality.pollutants =
              //             body.airQuality.pollutants.map((pollutant) => {
              //               switch (pollutant.pollutantType) {
              //                 case "CO": // Fix CO amount units
              //                   pollutant.units = "MILLIGRAMS_PER_CUBIC_METER";
              //                   break;
              //                 default:
              //                   break;
              //               }
              //               return pollutant;
              //             });
              //         break;
              //     }
              //     // ConvertAirQuality
              //     if (
              //       Settings?.AQI?.Local?.ReplaceScales.includes(
              //         body?.airQuality?.scale.split(".")?.[0]
              //       )
              //     )
              //       body = ConvertAirQuality(body, Settings);
              //     // Fix Convert units that does not supported in Apple Weather
              //     if (body?.airQuality?.pollutants)
              //       body.airQuality.pollutants = AirQuality.FixUnits(
              //         body.airQuality.pollutants
              //       );
              //     // ProviderLogo
              //     if (
              //       body?.airQuality?.metadata?.providerName &&
              //       !body?.airQuality?.metadata?.providerLogo
              //     )
              //       body.airQuality.metadata.providerLogo = providerNameToLogo(
              //         body?.airQuality?.metadata?.providerName,
              //         "v2"
              //       );
              //   }
              //   if (
              //     url.searchParams.get("dataSets").includes("currentWeather")
              //   ) {
              //     if (
              //       body?.currentWeather?.metadata?.providerName &&
              //       !body?.currentWeather?.metadata?.providerLogo
              //     )
              //       body.currentWeather.metadata.providerLogo =
              //         providerNameToLogo(
              //           body?.currentWeather?.metadata?.providerName,
              //           "v2"
              //         );
              //     //log(`🚧 body.currentWeather: ${JSON.stringify(body?.currentWeather, null, 2)}`, "");
              //   }
              //   if (
              //     url.searchParams.get("dataSets").includes("forecastNextHour")
              //   ) {
              //     if (!body?.forecastNextHour)
              //       body = await InjectForecastNextHour(url, body, Settings);
              //     if (
              //       body?.forecastNextHour?.metadata?.providerName &&
              //       !body?.forecastNextHour?.metadata?.providerLogo
              //     )
              //       body.forecastNextHour.metadata.providerLogo =
              //         providerNameToLogo(
              //           body?.forecastNextHour?.metadata?.providerName,
              //           "v2"
              //         );
              //   }
              //   if (
              //     url.searchParams.get("dataSets").includes("weatherAlerts")
              //   ) {
              //     if (
              //       body?.weatherAlerts?.metadata?.providerName &&
              //       !body?.weatherAlerts?.metadata?.providerLogo
              //     )
              //       body.weatherAlerts.metadata.providerLogo =
              //         providerNameToLogo(
              //           body?.weatherAlerts?.metadata?.providerName,
              //           "v2"
              //         );
              //   }
              //   if (
              //     url.searchParams.get("dataSets").includes("WeatherChange")
              //   ) {
              //     if (
              //       body?.WeatherChanges?.metadata?.providerName &&
              //       !body?.WeatherChanges?.metadata?.providerLogo
              //     )
              //       body.WeatherChanges.metadata.providerLogo =
              //         providerNameToLogo(
              //           body?.WeatherChanges?.metadata?.providerName,
              //           "v2"
              //         );
              //   }
              //   if (
              //     url.searchParams.get("dataSets").includes("trendComparison")
              //   ) {
              //     if (
              //       body?.historicalComparisons?.metadata?.providerName &&
              //       !body?.historicalComparisons?.metadata?.providerLogo
              //     )
              //       body.historicalComparisons.metadata.providerLogo =
              //         providerNameToLogo(
              //           body?.historicalComparisons?.metadata?.providerName,
              //           "v2"
              //         );
              //   }
              //   if (url.searchParams.get("dataSets").includes("locationInfo")) {
              //     if (
              //       body?.locationInfo?.metadata?.providerName &&
              //       !body?.locationInfo?.metadata?.providerLogo
              //     )
              //       body.locationInfo.metadata.providerLogo =
              //         providerNameToLogo(
              //           body?.locationInfo?.metadata?.providerName,
              //           "v2"
              //         );
              //   }
              //   const WeatherData = WeatherKit2.encode(Builder, "all", body);
              //   Builder.finish(WeatherData);
              //   break;
              // }

              rawBody = Builder.asUint8Array(); // Of type `Uint8Array`.
              break;
            case "application/protobuf":
            case "application/x-protobuf":
            case "application/vnd.google.protobuf":
            case "application/grpc":
            case "application/grpc+proto":
            case "application/octet-stream":
            default:
              break;
          }
          // 写入二进制数据
          $response.body = rawBody;
          break;
      }
      break;
    case false:
      break;
  }
})()
  .catch((e) => logError(e))
  .finally(() => $done($response));

if (body) {
  console.log(body);
}
$done({ body });

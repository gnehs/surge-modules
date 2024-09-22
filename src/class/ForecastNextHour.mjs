export default class ForecastNextHour {
  Name = "ForecastNextHour";
  Version = "v1.2.6";
  Author = "iRingo";

  static #Configs = {
    Pollutants: {
      co: "CO",
      no: "NO",
      no2: "NO2",
      so2: "SO2",
      o3: "OZONE",
      nox: "NOX",
      pm25: "PM2_5",
      pm10: "PM10",
      other: "NOT_AVAILABLE",
    },
    WeatherCondition: {
      晴朗: "CLEAR",
      雨夾雪: "SLEET",
      小雨: "DRIZZLE",
      下雨: "RAIN",
      中雨: "RAIN",
      大雨: "HEAVY_RAIN",
      小雪: "FLURRIES",
      下雪: "SNOW",
      中雪: "SNOW",
      大雪: "HEAVY_SNOW",
      冰雹: "HAIL",
    },
    PrecipitationType: {
      晴朗: "CLEAR",
      雨夾雪: "SLEET",
      rain: "RAIN",
      雨: "RAIN",
      snow: "SNOW",
      雪: "SNOW",
      冰雹: "HAIL",
    },
    Precipitation: {
      Level: {
        INVALID: -1,
        NO: 0,
        LIGHT: 1,
        MODERATE: 2,
        HEAVY: 3,
        STORM: 4,
      },
      Range: {
        /**
         * [降雨強度 | 彩雲天氣 API]{@link https://docs.caiyunapp.com/weather-api/v2/v2.6/tables/precip.html}
         */
        radar: {
          NO: [0, 0.031],
          LIGHT: [0.031, 0.25],
          MODERATE: [0.25, 0.35],
          HEAVY: [0.35, 0.48],
          STORM: [0.48, Number.MAX_VALUE],
        },
        mmph: {
          NO: [0, 0.08],
          LIGHT: [0.08, 3.44],
          MODERATE: [3.44, 11.33],
          HEAVY: [11.33, 51.3],
          STORM: [51.3, Number.MAX_VALUE],
        },
      },
    },
  };

  static WeatherCondition(sentence) {
    let weatherCondition = "CLEAR";
    Object.keys(this.#Configs.WeatherCondition).forEach((key) => {
      if (sentence.includes(key))
        weatherCondition = this.#Configs.WeatherCondition[key];
    });
    return weatherCondition;
  }

  static PrecipitationType(sentence) {
    let precipitationType = "CLEAR";
    Object.keys(this.#Configs.PrecipitationType).forEach((key) => {
      if (sentence.includes(key))
        precipitationType = this.#Configs.PrecipitationType[key];
    });
    return precipitationType;
  }

  static ConditionType(
    precipitationIntensity,
    precipitationType,
    units = "mmph"
  ) {
    // refer: https://docs.caiyunapp.com/weather-api/v2/v2.6/tables/precip.html precipitationType: ${precipitationType}`, "");
    const Range = this.#Configs.Precipitation.Range[units];
    let condition = "CLEAR";
    if (
      precipitationIntensity >= Range.NO[0] &&
      precipitationIntensity <= 0.001
    )
      condition = "CLEAR";
    else if (
      precipitationIntensity > 0.001 &&
      precipitationIntensity <= Range.NO[1]
    ) {
      switch (precipitationType) {
        case "RAIN":
          condition = "POSSIBLE_DRIZZLE";
          break;
        case "SNOW":
          condition = "POSSIBLE_FLURRIES";
          break;
        default:
          condition = `POSSIBLE_${precipitationType}`;
          break;
      }
    } else if (
      precipitationIntensity > Range.LIGHT[0] &&
      precipitationIntensity <= Range.LIGHT[1]
    ) {
      switch (precipitationType) {
        case "RAIN":
          condition = "DRIZZLE";
          break;
        case "SNOW":
          condition = "FLURRIES";
          break;
        default:
          condition = precipitationType;
          break;
      }
    } else if (
      precipitationIntensity > Range.MODERATE[0] &&
      precipitationIntensity <= Range.MODERATE[1]
    ) {
      switch (precipitationType) {
        case "RAIN":
          condition = "RAIN";
          break;
        case "SNOW":
          condition = "SNOW";
          break;
        default:
          condition = precipitationType;
          break;
      }
    } else if (precipitationIntensity > Range.HEAVY[0]) {
      switch (precipitationType) {
        case "RAIN":
          condition = "HEAVY_RAIN";
          break;
        case "SNOW":
          condition = "HEAVY_SNOW";
          break;
        default:
          condition = precipitationType;
          break;
      }
    }
    return condition;
  }

  static Minute(minutes = [], description = "", units = "mmph") {
    const PrecipitationType = this.PrecipitationType(description);
    minutes = minutes.map((minute) => {
      minute.condition = this.ConditionType(
        minute.precipitationIntensity,
        PrecipitationType,
        units
      );
      minute.perceivedPrecipitationIntensity =
        this.ConvertPrecipitationIntensity(
          minute.precipitationIntensity,
          minute.condition,
          units
        );
      if (minute.perceivedPrecipitationIntensity >= 0.001)
        minute.precipitationType = "RAIN";
      else minute.precipitationType = "CLEAR";
      return minute;
    });
    return minutes;
  }

  static Summary(minutes = []) {
    const Summaries = [];
    const Summary = {
      condition: "CLEAR",
      precipitationChance: 0,
      startTime: 0,
      precipitationIntensity: 0,
    };
    const Length = Math.min(71, minutes.length);
    for (let i = 0; i < Length; i++) {
      const minute = minutes[i];
      const previousMinute = minutes[i - 1];
      let maxPrecipitationIntensity = Math.max(
        minute?.precipitationIntensity ?? 0,
        previousMinute?.precipitationIntensity ?? 0
      );
      let maxPrecipitationChance = Math.max(
        minute?.precipitationChance ?? 0,
        previousMinute?.precipitationChance ?? 0
      );
      switch (i) {
        case 0:
          Summary.startTime = minute.startTime;
          if (minute?.precipitationIntensity > 0) {
            Summary.condition = minute.precipitationType;
            Summary.precipitationChance = maxPrecipitationChance;
            Summary.precipitationIntensity = maxPrecipitationIntensity;
          }
          break;
        default:
          if (minute?.precipitationType !== previousMinute?.precipitationType) {
            Summary.endTime = minute.startTime;
            switch (Summary.condition) {
              case "CLEAR":
                break;
              default:
                Summary.precipitationChance = maxPrecipitationChance;
                Summary.precipitationIntensity = maxPrecipitationIntensity;
                break;
            }
            Summaries.push({ ...Summary });
            // reset
            Summary.startTime = minute.startTime;
            switch (Summary.condition) {
              case "CLEAR":
                Summary.condition = minute.precipitationType;
                Summary.precipitationChance = minute.precipitationChance;
                Summary.precipitationIntensity = minute.precipitationIntensity;
                break;
              default:
                Summary.condition = "CLEAR";
                Summary.precipitationChance = 0;
                Summary.precipitationIntensity = 0;
                break;
            }
            maxPrecipitationChance = 0;
            maxPrecipitationIntensity = 0;
          }
          break;
        case Length - 1:
          Summary.endTime = 0; // ⚠️空值必須寫零！
          switch (Summary.condition) {
            case "CLEAR":
              break;
            default:
              Summary.precipitationChance = maxPrecipitationChance;
              Summary.precipitationIntensity = maxPrecipitationIntensity;
              break;
          }
          Summaries.push({ ...Summary });
          break;
      }
    }
    return Summaries;
  }

  static Condition(minutes = []) {
    const Conditions = [];
    const Condition = {
      beginCondition: "CLEAR",
      endCondition: "CLEAR",
      forecastToken: "CLEAR",
      parameters: [],
      startTime: 0,
    };
    const Length = Math.min(71, minutes.length);
    for (let i = 0; i < Length; i++) {
      const minute = minutes[i];
      const previousMinute = minutes[i - 1];
      //log(`⚠️ ${i}, before, minute: ${JSON.stringify(minute, null, 2)}\nCondition: ${JSON.stringify(Condition, null, 2)}`, "");
      switch (i) {
        case 0:
          //log(`⚠️ ${i}, before, minute: ${JSON.stringify(minute, null, 2)}\nCondition: ${JSON.stringify(Condition, null, 2)}`, "");
          Condition.beginCondition = minute.condition;
          Condition.endCondition = minute.condition;
          Condition.startTime = minute.startTime;
          switch (minute.precipitationType) {
            case "CLEAR": //✅
              Condition.forecastToken = "CLEAR";
              break;
            default: //✅
              Condition.forecastToken = "CONSTANT";
              break;
          }
          Condition.parameters = [];
          //log(`⚠️ ${i}, after, minute: ${JSON.stringify(minute, null, 2)}\nCondition: ${JSON.stringify(Condition, null, 2)}`, "");
          break;
        default:
          switch (minute?.precipitationType) {
            case previousMinute?.precipitationType: // ✅與前次相同
              switch (minute?.condition) {
                case previousMinute?.condition: // ✅與前次相同
                  break;
                default: // ✅與前次不同
                  switch (Condition.forecastToken) {
                    case "CONSTANT":
                      Condition.endTime = minute.startTime; // ✅更新結束時間
                      switch (Condition.beginCondition) {
                        case Condition.endCondition: // ✅與begin相同
                          Condition.parameters = [];
                          Conditions.push({ ...Condition });
                          break;
                        default: // ✅與begin不同
                          Condition.endCondition = previousMinute.condition;
                          Condition.parameters = [
                            { date: Condition.endTime, type: "FIRST_AT" },
                          ];
                          Conditions.push({ ...Condition });
                          // ✅CONSTANT
                          Condition.beginCondition = minute.condition;
                          break;
                      }
                      Condition.endCondition = minute.condition;
                      Condition.startTime = Condition.endTime; // ✅更新開始時間
                      Condition.parameters = [];
                      break;
                  }
                  break;
              }
              break;
            default: // 與前次不同
              switch (Condition.forecastToken) {
                case "CLEAR": // ✅當前RAIN
                  // ✅START
                  Condition.beginCondition = minute.condition;
                  Condition.endCondition = minute.condition;
                  Condition.forecastToken = "START"; // ✅不推送，可能變為START_STOP
                  Condition.endTime = minute.startTime; // ✅更新結束時間
                  Condition.parameters = [
                    { date: Condition.endTime, type: "FIRST_AT" },
                  ];
                  break;
                case "CONSTANT": // ✅當前CLEAR
                  Conditions.length = 0; // ✅清空
                  // ✅STOP
                  Condition.beginCondition = minutes[0].condition; // ✅更新結束條件
                  Condition.endCondition = previousMinute.condition; // ✅更新結束條件
                  Condition.forecastToken = "STOP"; // ✅不推送，可能變為STOP_START
                  Condition.endTime = minute.startTime; // ✅更新結束時間
                  Condition.parameters = [
                    { date: Condition.endTime, type: "FIRST_AT" },
                  ];
                  break;
                case "START": // ✅當前CLEAR
                  // ✅START_STOP
                  Condition.endCondition = previousMinute.condition; // ✅更新結束條件
                  Condition.forecastToken = "START_STOP";
                  Condition.parameters.push({
                    date: minute.startTime,
                    type: "SECOND_AT",
                  });
                  Conditions.push({ ...Condition });
                  // ✅STOP
                  Condition.beginCondition = previousMinute.condition;
                  Condition.endCondition = previousMinute.condition;
                  Condition.forecastToken = "STOP"; // ✅不推送，可能變為STOP_START
                  Condition.startTime = Condition.endTime;
                  Condition.endTime = minute.startTime; // ✅更新結束時間
                  Condition.parameters = [
                    { date: Condition.endTime, type: "FIRST_AT" },
                  ];
                  break;
                case "STOP": // ✅當前RAIN
                  // ✅STOP_START
                  Condition.forecastToken = "STOP_START";
                  Condition.parameters.push({
                    date: minute.startTime,
                    type: "SECOND_AT",
                  });
                  Conditions.push({ ...Condition });
                  // ✅START
                  Condition.beginCondition = minute.condition;
                  Condition.endCondition = minute.condition;
                  Condition.forecastToken = "START"; // ✅不推送，可能變為START_STOP
                  Condition.startTime = Condition.endTime;
                  Condition.endTime = minute.startTime; // ✅更新結束時間
                  Condition.parameters = [
                    { date: Condition.endTime, type: "FIRST_AT" },
                  ];
                  break;
                case "START_STOP": // ✅當前RAIN
                  break;
                case "STOP_START": // ✅當前CLEAR
                  break;
              }
              break;
          }
          break;
        case Length - 1:
          switch (Condition.forecastToken) {
            case "CLEAR": // ✅當前CLEAR
              // ✅確定CLEAR
              Condition.beginCondition = "CLEAR";
              Condition.endCondition = "CLEAR";
              Condition.forecastToken = "CLEAR";
              Condition.endTime = 0; // ⚠️空值必須寫零！
              Condition.parameters = [];
              Conditions.push({ ...Condition });
              break;
            case "CONSTANT": // ✅當前RAIN
              // ✅確定CONSTANT
              Condition.endCondition = minute.condition;
              Condition.endTime = 0; // ⚠️空值必須寫零！
              Condition.parameters = [];
              Conditions.push({ ...Condition });
              break;
            case "START": // ✅當前RAIN
              // ✅確定START
              Conditions.push({ ...Condition });
              // ✅補充CONSTANT
              Condition.endCondition = previousMinute.condition;
              Condition.forecastToken = "CONSTANT";
              Condition.startTime = Condition.endTime;
              Condition.endTime = 0; // ⚠️空值必須寫零！
              Condition.parameters = [];
              Conditions.push({ ...Condition });
              break;
            case "STOP": // ✅當前CLEAR
              // ✅確定STOP
              Conditions.push({ ...Condition });
              // ✅補充CLEAR
              Condition.beginCondition = "CLEAR";
              Condition.endCondition = "CLEAR";
              Condition.forecastToken = "CLEAR";
              Condition.startTime = Condition.endTime;
              Condition.endTime = 0; // ⚠️空值必須寫零！
              Condition.parameters = [];
              Conditions.push({ ...Condition });
              break;
            case "START_STOP": // ✅當前CLEAR
              break;
            case "STOP_START": // ✅當前RAIN
              break;
          }
          break;
      }
      //log(`⚠️ ${i}, after, minute: ${JSON.stringify(minute, null, 2)}\nCondition: ${JSON.stringify(Condition, null, 2)}`, "");
    }
    return Conditions;
  }

  static ConvertPrecipitationIntensity(
    precipitationIntensity,
    condition,
    units = "mmph"
  ) {
    let perceivedPrecipitationIntensity = 0;
    const Range = this.#Configs.Precipitation.Range[units];
    let level = 0;
    let range = [];
    switch (condition) {
      case "CLEAR":
        level = 0;
        range = [Range.NO[0], 0.001];
        break;
      case "POSSIBLE_DRIZZLE":
      case "POSSIBLE_FLURRIES":
        level = 0;
        range = [0.001, Range.NO[1]];
        break;
      case "DRIZZLE":
      case "FLURRIES":
        level = 0;
        range = Range.LIGHT;
        break;
      case "RAIN":
      case "SNOW":
        level = 1;
        range = Range.MODERATE;
        break;
      case "HEAVY_RAIN":
      case "HEAVY_SNOW":
        level = 2;
        range = Range.HEAVY;
        break;
    }
    perceivedPrecipitationIntensity =
      level + (precipitationIntensity - range[0]) / (range[1] - range[0]);
    perceivedPrecipitationIntensity = Math.min(
      3,
      perceivedPrecipitationIntensity
    );
    return perceivedPrecipitationIntensity;
  }
}

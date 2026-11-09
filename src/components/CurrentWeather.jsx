import {
  Thermometer,
  Droplets,
  Wind,
  CloudRain,
  Sunrise,
  Sunset,
  SunMedium,
  Umbrella,
} from 'lucide-react'
import { getUvIndexStatus } from '../api/weather'
import WeatherIcon from './WeatherIcon'

export default function CurrentWeather({
  cityName,
  current,
  weatherInfo,
  todayDaily,
  tempUnit = 'C',
}) {
  if (!current) return null

  const convertTemp = (celsius) => {
    if (tempUnit === 'F') {
      return Math.round((celsius * 9) / 5 + 32)
    }
    return Math.round(celsius)
  }

  const formatClock = (isoStr) => {
    if (!isoStr) return '--:--'
    const parts = isoStr.split('T')
    return parts[1] || isoStr
  }

  const temp = convertTemp(current.temperature_2m)
  const apparentTemp = convertTemp(current.apparent_temperature)

  // 상세 지표 데이터
  const sunriseTime = formatClock(todayDaily?.sunrise?.[0])
  const sunsetTime = formatClock(todayDaily?.sunset?.[0])
  const rainProbability = todayDaily?.precipitation_probability_max?.[0] ?? 0
  const uvValue = current.uv_index !== undefined ? current.uv_index : todayDaily?.uv_index_max?.[0]
  const uvStatus = getUvIndexStatus(uvValue)

  return (
    <article className="card weather-card">
      <div className="card-top">
        <div>
          <span className="card-badge">현재 날씨</span>
          <h2 className="city-heading">{cityName}</h2>
        </div>
        {weatherInfo && (
          <div
            className="weather-icon-badge"
            style={{ backgroundColor: `${weatherInfo.color}18` }}
          >
            <WeatherIcon name={weatherInfo.icon} size={48} color={weatherInfo.color} />
          </div>
        )}
      </div>

      <div className="weather-main-stat">
        <div className="temperature-huge">
          {temp}
          <span className="unit">°{tempUnit}</span>
        </div>
        <div className="weather-label" style={{ color: weatherInfo?.color }}>
          {weatherInfo?.label}
        </div>
      </div>

      {/* 기본 기상 메트릭 (체감, 습도, 풍속, 강수량) */}
      <div className="weather-sub-metrics">
        <div className="metric-item">
          <Thermometer size={18} className="metric-icon" />
          <div className="metric-info">
            <span className="metric-label">체감 온도</span>
            <span className="metric-value">{apparentTemp}°{tempUnit}</span>
          </div>
        </div>
        <div className="metric-item">
          <Droplets size={18} className="metric-icon" />
          <div className="metric-info">
            <span className="metric-label">습도</span>
            <span className="metric-value">{current.relative_humidity_2m}%</span>
          </div>
        </div>
        <div className="metric-item">
          <Wind size={18} className="metric-icon" />
          <div className="metric-info">
            <span className="metric-label">풍속</span>
            <span className="metric-value">{current.wind_speed_10m} km/h</span>
          </div>
        </div>
        {current.precipitation > 0 && (
          <div className="metric-item">
            <CloudRain size={18} className="metric-icon" />
            <div className="metric-info">
              <span className="metric-label">강수량</span>
              <span className="metric-value">{current.precipitation} mm</span>
            </div>
          </div>
        )}
      </div>

      {/* 상세 기상 지표 (옵션 C: 자외선 지수, 일출/일몰, 강수 확률) */}
      <div className="weather-extra-metrics">
        {/* 자외선 지수 */}
        <div className="extra-metric-box">
          <div className="extra-metric-header">
            <SunMedium size={16} className="extra-icon uv-icon" />
            <span className="extra-title">자외선 지수</span>
          </div>
          <div className="extra-metric-body">
            <span className="extra-val">{uvValue !== undefined ? Number(uvValue).toFixed(1) : '-'}</span>
            <span
              className="uv-badge"
              style={{
                backgroundColor: `${uvStatus.color}20`,
                color: uvStatus.color,
                borderColor: `${uvStatus.color}50`,
              }}
            >
              {uvStatus.status}
            </span>
          </div>
        </div>

        {/* 강수 확률 */}
        <div className="extra-metric-box">
          <div className="extra-metric-header">
            <Umbrella size={16} className="extra-icon rain-icon" />
            <span className="extra-title">강수 확률</span>
          </div>
          <div className="extra-metric-body">
            <span className="extra-val">{rainProbability}%</span>
            <span className="extra-subtext">오늘 하루</span>
          </div>
        </div>

        {/* 일출 시간 */}
        <div className="extra-metric-box">
          <div className="extra-metric-header">
            <Sunrise size={16} className="extra-icon sunrise-icon" />
            <span className="extra-title">일출</span>
          </div>
          <div className="extra-metric-body">
            <span className="extra-val">{sunriseTime}</span>
            <span className="extra-subtext">오늘 아침</span>
          </div>
        </div>

        {/* 일몰 시간 */}
        <div className="extra-metric-box">
          <div className="extra-metric-header">
            <Sunset size={16} className="extra-icon sunset-icon" />
            <span className="extra-title">일몰</span>
          </div>
          <div className="extra-metric-body">
            <span className="extra-val">{sunsetTime}</span>
            <span className="extra-subtext">오늘 저녁</span>
          </div>
        </div>
      </div>
    </article>
  )
}

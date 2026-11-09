import { Thermometer, Droplets, Wind, CloudRain } from 'lucide-react'
import WeatherIcon from './WeatherIcon'

export default function CurrentWeather({ cityName, current, weatherInfo }) {
  if (!current) return null

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
          {Math.round(current.temperature_2m)}
          <span className="unit">°C</span>
        </div>
        <div className="weather-label" style={{ color: weatherInfo?.color }}>
          {weatherInfo?.label}
        </div>
      </div>

      <div className="weather-sub-metrics">
        <div className="metric-item">
          <Thermometer size={18} className="metric-icon" />
          <div className="metric-info">
            <span className="metric-label">체감 온도</span>
            <span className="metric-value">{Math.round(current.apparent_temperature)}°C</span>
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
    </article>
  )
}


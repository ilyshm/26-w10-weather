import { useState, useEffect, useCallback } from 'react'
import {
  DEFAULT_CITIES,
  getWeatherInfo,
  getAirQualityStatus,
  fetchWeatherData,
  fetchAirQualityData,
} from './api/weather'
import {
  Sun,
  SunDim,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  Snowflake,
  CloudLightning,
  Thermometer,
  Droplets,
  Wind,
  MapPin,
  RefreshCw,
  AlertCircle,
  Activity,
} from 'lucide-react'
import './App.css'

// 날씨 코드에 대응하는 Lucide 아이콘 매핑
const WEATHER_ICONS = {
  Sun,
  SunDim,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  Snowflake,
  CloudLightning,
}

function DynamicWeatherIcon({ name, size = 48, color }) {
  const IconComponent = WEATHER_ICONS[name] || Cloud
  return <IconComponent size={size} color={color} strokeWidth={2} />
}

export default function App() {
  const [selectedCity, setSelectedCity] = useState(DEFAULT_CITIES[0])
  const [weatherData, setWeatherData] = useState(null)
  const [airQualityData, setAirQualityData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadCityData = useCallback(async (city) => {
    setLoading(true)
    setError(null)
    try {
      const [weather, airQuality] = await Promise.all([
        fetchWeatherData(city.lat, city.lon),
        fetchAirQualityData(city.lat, city.lon),
      ])
      setWeatherData(weather)
      setAirQualityData(airQuality)
    } catch (err) {
      setError(err.message || '기상 데이터를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCityData(selectedCity)
  }, [selectedCity, loadCityData])

  const currentWeather = weatherData?.current
  const currentAir = airQualityData?.current
  const weatherInfo = currentWeather ? getWeatherInfo(currentWeather.weather_code) : null
  const airStatus = currentAir ? getAirQualityStatus(currentAir.pm10, currentAir.pm2_5) : null

  return (
    <div className="weather-app">
      {/* 대시보드 헤더 */}
      <header className="app-header">
        <div className="header-title-wrap">
          <h1 className="header-title">실시간 날씨 & 미세먼지</h1>
          <p className="header-subtitle">Open-Meteo API 기반 실시간 기상 관측 대시보드</p>
        </div>
        <button
          type="button"
          className="refresh-btn"
          onClick={() => loadCityData(selectedCity)}
          disabled={loading}
          title="새로고침"
        >
          <RefreshCw size={18} className={loading ? 'spinning' : ''} />
          <span>새로고침</span>
        </button>
      </header>

      {/* 주요 도시 빠른 선택 버튼 그룹 */}
      <section className="city-selector-section" aria-label="도시 빠른 선택">
        <div className="city-buttons-wrapper">
          {DEFAULT_CITIES.map((city) => {
            const isSelected = selectedCity.name === city.name
            return (
              <button
                key={city.name}
                type="button"
                className={`city-pill ${isSelected ? 'active' : ''}`}
                onClick={() => setSelectedCity(city)}
              >
                <MapPin size={14} />
                <span>{city.name}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* 에러 상태 안내 */}
      {error && (
        <section className="status-banner error-banner">
          <AlertCircle size={22} />
          <div className="status-text">
            <strong>오류가 발생했습니다:</strong> {error}
          </div>
          <button
            type="button"
            className="retry-btn"
            onClick={() => loadCityData(selectedCity)}
          >
            다시 시도
          </button>
        </section>
      )}

      {/* 로딩 표시 */}
      {loading && !weatherData && (
        <section className="status-banner loading-banner">
          <RefreshCw size={24} className="spinning" />
          <span>기상 및 대기질 정보를 실시간으로 수신하고 있습니다...</span>
        </section>
      )}

      {/* 메인 대시보드 카드 영역 */}
      {weatherData && airQualityData && (
        <main className={`dashboard-grid ${loading ? 'updating' : ''}`}>
          {/* 1. 현재 날씨 카드 */}
          <article className="card weather-card">
            <div className="card-top">
              <div>
                <span className="card-badge">현재 날씨</span>
                <h2 className="city-heading">{selectedCity.name}</h2>
              </div>
              {weatherInfo && (
                <div className="weather-icon-badge" style={{ backgroundColor: `${weatherInfo.color}18` }}>
                  <DynamicWeatherIcon name={weatherInfo.icon} size={48} color={weatherInfo.color} />
                </div>
              )}
            </div>

            <div className="weather-main-stat">
              <div className="temperature-huge">
                {Math.round(currentWeather.temperature_2m)}
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
                  <span className="metric-value">{Math.round(currentWeather.apparent_temperature)}°C</span>
                </div>
              </div>
              <div className="metric-item">
                <Droplets size={18} className="metric-icon" />
                <div className="metric-info">
                  <span className="metric-label">습도</span>
                  <span className="metric-value">{currentWeather.relative_humidity_2m}%</span>
                </div>
              </div>
              <div className="metric-item">
                <Wind size={18} className="metric-icon" />
                <div className="metric-info">
                  <span className="metric-label">풍속</span>
                  <span className="metric-value">{currentWeather.wind_speed_10m} km/h</span>
                </div>
              </div>
            </div>
          </article>

          {/* 2. 미세먼지 카드 */}
          <article className="card air-card">
            <div className="card-top">
              <div>
                <span className="card-badge">대기질 정보</span>
                <h2 className="city-heading">미세먼지 상태</h2>
              </div>
              {airStatus && (
                <div
                  className="air-status-pill"
                  style={{
                    backgroundColor: airStatus.badgeColor,
                    color: '#ffffff',
                  }}
                >
                  <Activity size={14} />
                  <span>{airStatus.status}</span>
                </div>
              )}
            </div>

            <p className="air-description">
              한국 환경부 기준에 따른 실시간 대기 오염도 평가입니다.
            </p>

            <div className="air-metrics-grid">
              <div className="air-stat-box">
                <div className="stat-header">
                  <span className="stat-name">미세먼지 (PM10)</span>
                  <span className="stat-tag">μg/m³</span>
                </div>
                <div className="stat-number">{Math.round(currentAir.pm10)}</div>
                <div className="stat-guide">
                  <span>기준: 0~30 좋음 / 81~ 나쁨</span>
                </div>
              </div>

              <div className="air-stat-box">
                <div className="stat-header">
                  <span className="stat-name">초미세먼지 (PM2.5)</span>
                  <span className="stat-tag">μg/m³</span>
                </div>
                <div className="stat-number">{Math.round(currentAir.pm2_5)}</div>
                <div className="stat-guide">
                  <span>기준: 0~15 좋음 / 36~ 나쁨</span>
                </div>
              </div>
            </div>

            <div className="air-legend">
              <span className="legend-item"><span className="dot" style={{ backgroundColor: '#10b981' }}></span> 좋음</span>
              <span className="legend-item"><span className="dot" style={{ backgroundColor: '#3b82f6' }}></span> 보통</span>
              <span className="legend-item"><span className="dot" style={{ backgroundColor: '#f97316' }}></span> 나쁨</span>
              <span className="legend-item"><span className="dot" style={{ backgroundColor: '#ef4444' }}></span> 매우 나쁨</span>
            </div>
          </article>
        </main>
      )}

      {/* 푸터 */}
      <footer className="app-footer">
        <p>기상 데이터 제공: Open-Meteo Free Weather & Air Quality API (HTTPS)</p>
      </footer>
    </div>
  )
}

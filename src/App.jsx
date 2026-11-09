import { useState, useEffect, useCallback } from 'react'
import {
  DEFAULT_CITIES,
  getWeatherInfo,
  getAirQualityStatus,
  fetchWeatherData,
  fetchAirQualityData,
} from './api/weather'
import {
  MapPin,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'
import CurrentWeather from './components/CurrentWeather'
import AirQualityCard from './components/AirQualityCard'
import HourlyChart from './components/HourlyChart'
import WeeklyForecast from './components/WeeklyForecast'
import CitySearch from './components/CitySearch'
import './App.css'

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
          <p className="header-subtitle">Open-Meteo API 기반 글로벌 기상 관측 대시보드</p>
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

      {/* 도시 검색창 (400ms 디바운스 적용) */}
      <section className="search-section" aria-label="도시 검색">
        <CitySearch onSelectCity={(city) => setSelectedCity(city)} />
      </section>

      {/* 주요 도시 빠른 선택 버튼 그룹 */}
      <section className="city-selector-section" aria-label="주요 도시 빠른 선택">
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

      {/* 초기 로딩 표시 */}
      {loading && !weatherData && (
        <section className="status-banner loading-banner">
          <RefreshCw size={24} className="spinning" />
          <span>기상 및 대기질 정보를 실시간으로 수신하고 있습니다...</span>
        </section>
      )}

      {/* 메인 대시보드 컨텐츠 */}
      {weatherData && airQualityData && (
        <main className={`dashboard-content ${loading ? 'updating' : ''}`}>
          {/* 상단 2열: 현재 날씨 + 미세먼지 카드 */}
          <div className="dashboard-grid top-grid">
            <CurrentWeather
              cityName={selectedCity.name}
              current={currentWeather}
              weatherInfo={weatherInfo}
            />
            <AirQualityCard
              current={currentAir}
              airStatus={airStatus}
            />
          </div>

          {/* 24시간 시간별 기온 차트 */}
          <HourlyChart hourly={weatherData.hourly} />

          {/* 7일간 주간 예보 */}
          <WeeklyForecast daily={weatherData.daily} />
        </main>
      )}

      {/* 푸터 */}
      <footer className="app-footer">
        <p>기상 데이터 제공: Open-Meteo Free Weather & Air Quality API (HTTPS)</p>
      </footer>
    </div>
  )
}

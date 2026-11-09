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
  History,
  X,
  Sun,
  Moon,
} from 'lucide-react'
import CurrentWeather from './components/CurrentWeather'
import AirQualityCard from './components/AirQualityCard'
import HourlyChart from './components/HourlyChart'
import WeeklyForecast from './components/WeeklyForecast'
import CitySearch from './components/CitySearch'
import './App.css'

const RECENT_CITIES_STORAGE_KEY = 'weather_recent_cities_v1'

export default function App() {
  const [selectedCity, setSelectedCity] = useState(DEFAULT_CITIES[0])
  const [weatherData, setWeatherData] = useState(null)
  const [airQualityData, setAirQualityData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // 나만의 기능 1: 섭씨/화씨 단위 전환 상태 (°C / °F)
  const [tempUnit, setTempUnit] = useState('C')

  // 나만의 기능 2: 최근 본 도시 목록 (localStorage 연동)
  const [recentCities, setRecentCities] = useState(() => {
    try {
      const saved = localStorage.getItem(RECENT_CITIES_STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // 최근 본 도시 추가
  const addRecentCity = useCallback((city) => {
    setRecentCities((prev) => {
      const filtered = prev.filter((c) => c.name !== city.name)
      const updated = [city, ...filtered].slice(0, 5) // 최대 5개 저장
      try {
        localStorage.setItem(RECENT_CITIES_STORAGE_KEY, JSON.stringify(updated))
      } catch (err) {
        console.warn('localStorage 저장 실패:', err)
      }
      return updated
    })
  }, [])

  // 최근 본 도시 개별 삭제
  const removeRecentCity = (e, cityName) => {
    e.stopPropagation()
    setRecentCities((prev) => {
      const updated = prev.filter((c) => c.name !== cityName)
      try {
        localStorage.setItem(RECENT_CITIES_STORAGE_KEY, JSON.stringify(updated))
      } catch (err) {
        console.warn('localStorage 저장 실패:', err)
      }
      return updated
    })
  }

  // 기상 데이터 로드
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
      addRecentCity(city)
    } catch (err) {
      setError(err.message || '기상 데이터를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }, [addRecentCity])

  useEffect(() => {
    loadCityData(selectedCity)
  }, [selectedCity, loadCityData])

  const currentWeather = weatherData?.current
  const currentAir = airQualityData?.current
  const weatherInfo = currentWeather ? getWeatherInfo(currentWeather.weather_code) : null
  const airStatus = currentAir ? getAirQualityStatus(currentAir.pm10, currentAir.pm2_5) : null

  // 나만의 기능 3: 날씨 및 낮/밤 기반 동적 비주얼 테마 클래스 계산
  const getWeatherThemeClass = () => {
    if (!currentWeather) return 'theme-default'
    if (currentWeather.is_day === 0) return 'theme-night'

    const code = currentWeather.weather_code
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82, 95].includes(code)) return 'theme-rain'
    if ([71, 73, 75, 77].includes(code)) return 'theme-snow'
    if ([1, 2, 3, 45, 48].includes(code)) return 'theme-cloudy'
    if (code === 0) return 'theme-clear'
    return 'theme-default'
  }

  return (
    <div className={`app-backdrop ${getWeatherThemeClass()}`}>
      <div className="weather-app">
        {/* 대시보드 헤더 */}
        <header className="app-header">
          <div className="header-title-wrap">
            <div className="header-badge-row">
              <span className="live-indicator"><span className="pulse-dot"></span> LIVE</span>
              {currentWeather && (
                <span className="day-night-tag">
                  {currentWeather.is_day ? <Sun size={13} /> : <Moon size={13} />}
                  {currentWeather.is_day ? '주간' : '야간'}
                </span>
              )}
            </div>
            <h1 className="header-title">실시간 기상 대시보드</h1>
            <p className="header-subtitle">Open-Meteo API 기반 글로벌 실시간 기상 관측 센터</p>
          </div>

          <div className="header-controls">
            {/* 단위 변환 토글 (°C / °F) */}
            <div className="unit-toggle" role="group" aria-label="온도 단위 변환">
              <button
                type="button"
                className={`unit-btn ${tempUnit === 'C' ? 'active' : ''}`}
                onClick={() => setTempUnit('C')}
              >
                °C
              </button>
              <button
                type="button"
                className={`unit-btn ${tempUnit === 'F' ? 'active' : ''}`}
                onClick={() => setTempUnit('F')}
              >
                °F
              </button>
            </div>

            {/* 새로고침 버튼 */}
            <button
              type="button"
              className="refresh-btn"
              onClick={() => loadCityData(selectedCity)}
              disabled={loading}
              title="새로고침"
            >
              <RefreshCw size={16} className={loading ? 'spinning' : ''} />
              <span className="btn-text">새로고침</span>
            </button>
          </div>
        </header>

        {/* 도시 검색창 */}
        <section className="search-section" aria-label="도시 검색">
          <CitySearch onSelectCity={(city) => setSelectedCity(city)} />
        </section>

        {/* 최근 본 도시 칩 목록 (옵션 B) */}
        {recentCities.length > 0 && (
          <section className="recent-cities-section" aria-label="최근 본 도시">
            <div className="recent-label">
              <History size={14} />
              <span>최근 본 도시:</span>
            </div>
            <div className="recent-chips-wrapper">
              {recentCities.map((city) => (
                <button
                  key={city.name}
                  type="button"
                  className={`recent-chip ${selectedCity.name === city.name ? 'active' : ''}`}
                  onClick={() => setSelectedCity(city)}
                >
                  <span className="chip-name">{city.name}</span>
                  <span
                    className="chip-remove"
                    onClick={(e) => removeRecentCity(e, city.name)}
                    title="기록 삭제"
                  >
                    <X size={12} />
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

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
                  <MapPin size={13} />
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
            {/* 상단 그리드: 현재 날씨 + 미세먼지 카드 */}
            <div className="dashboard-grid top-grid">
              <CurrentWeather
                cityName={selectedCity.name}
                current={currentWeather}
                weatherInfo={weatherInfo}
                todayDaily={weatherData?.daily}
                tempUnit={tempUnit}
              />
              <AirQualityCard
                current={currentAir}
                airStatus={airStatus}
              />
            </div>

            {/* 24시간 시간별 기온 차트 */}
            <HourlyChart
              hourly={weatherData.hourly}
              tempUnit={tempUnit}
            />

            {/* 7일간 주간 예보 */}
            <WeeklyForecast
              daily={weatherData.daily}
              tempUnit={tempUnit}
            />
          </main>
        )}

        {/* 푸터 */}
        <footer className="app-footer">
          <p>데이터 제공: Open-Meteo Free Weather & Air Quality API (HTTPS) • 사이버보안과 실시간 관측 대시보드</p>
        </footer>
      </div>
    </div>
  )
}

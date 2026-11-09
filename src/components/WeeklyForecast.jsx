import { Calendar, Umbrella } from 'lucide-react'
import { getWeatherInfo } from '../api/weather'
import WeatherIcon from './WeatherIcon'

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토']

export default function WeeklyForecast({ daily }) {
  if (!daily || !daily.time) return null

  // 이번 주 전체 최저/최고 기온 (범위 바 렌더링용)
  const minTemps = daily.temperature_2m_min || []
  const maxTemps = daily.temperature_2m_max || []
  const overallMin = Math.min(...minTemps)
  const overallMax = Math.max(...maxTemps)
  const totalRange = Math.max(overallMax - overallMin, 1)

  const items = daily.time.map((timeStr, idx) => {
    const date = new Date(timeStr)
    const dayOfWeek = DAY_NAMES[date.getDay()]
    const month = date.getMonth() + 1
    const day = date.getDate()

    let dayLabel = `${dayOfWeek}요일`
    if (idx === 0) dayLabel = '오늘'
    else if (idx === 1) dayLabel = '내일'

    const weatherCode = daily.weather_code ? daily.weather_code[idx] : 0
    const weather = getWeatherInfo(weatherCode)
    const min = Math.round(minTemps[idx])
    const max = Math.round(maxTemps[idx])
    const rainProb = daily.precipitation_probability_max ? daily.precipitation_probability_max[idx] : 0

    // 상대적 기온 바 위치 계산 (%)
    const barLeft = Math.max(0, ((min - overallMin) / totalRange) * 100)
    const barWidth = Math.max(8, ((max - min) / totalRange) * 100)

    return {
      dateStr: `${month}.${day}`,
      dayLabel,
      weather,
      min,
      max,
      rainProb,
      barLeft,
      barWidth,
    }
  })

  return (
    <article className="card weekly-card">
      <div className="card-top">
        <div>
          <span className="card-badge">7일간 예보</span>
          <h2 className="city-heading">주간 날씨 전망</h2>
        </div>
        <div className="chart-header-hint">
          <Calendar size={16} />
          <span>향후 7일간</span>
        </div>
      </div>

      <div className="weekly-list">
        {items.map((item, idx) => (
          <div key={idx} className={`weekly-row ${idx === 0 ? 'today-row' : ''}`}>
            {/* 요일 및 날짜 */}
            <div className="day-info">
              <span className="day-label">{item.dayLabel}</span>
              <span className="day-date">{item.dateStr}</span>
            </div>

            {/* 날씨 아이콘 & 강수확률 */}
            <div className="weather-preview">
              <WeatherIcon name={item.weather.icon} size={22} color={item.weather.color} />
              <span className="weather-desc">{item.weather.label}</span>
              {item.rainProb > 0 && (
                <span className="rain-badge">
                  <Umbrella size={12} />
                  {item.rainProb}%
                </span>
              )}
            </div>

            {/* 최저 기온 */}
            <div className="temp-column temp-min">
              {item.min}°
            </div>

            {/* 기온 범위 바 */}
            <div className="temp-bar-container">
              <div
                className="temp-bar-fill"
                style={{
                  left: `${item.barLeft}%`,
                  width: `${item.barWidth}%`,
                }}
              />
            </div>

            {/* 최고 기온 */}
            <div className="temp-column temp-max">
              {item.max}°
            </div>
          </div>
        ))}
      </div>
    </article>
  )
}

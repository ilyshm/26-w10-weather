import { useMemo } from 'react'
import { Clock } from 'lucide-react'
import { getWeatherInfo } from '../api/weather'
import WeatherIcon from './WeatherIcon'

export default function HourlyChart({ hourly, tempUnit = 'C' }) {
  // 현재 시각 기준 향후 24시간 데이터 추출
  const chartData = useMemo(() => {
    if (!hourly || !hourly.time || !hourly.temperature_2m) return []

    const convertTemp = (celsius) => {
      if (tempUnit === 'F') {
        return Math.round((celsius * 9) / 5 + 32)
      }
      return Math.round(celsius)
    }

    const now = new Date()
    const currentIsoHour = now.toISOString().slice(0, 13) // "YYYY-MM-DDTHH"

    // 현재 시간에 가장 가까운 인덱스 탐색
    let startIndex = hourly.time.findIndex((t) => t.startsWith(currentIsoHour))
    if (startIndex === -1) {
      startIndex = 0
    }

    const sliceLength = 24
    const selectedPoints = []

    for (let i = 0; i < sliceLength && startIndex + i < hourly.time.length; i++) {
      const idx = startIndex + i
      const timeStr = hourly.time[idx]
      const dateObj = new Date(timeStr)
      const hour = dateObj.getHours()
      const isNow = i === 0

      selectedPoints.push({
        time: isNow ? '지금' : `${hour}시`,
        fullTime: `${dateObj.getMonth() + 1}월 ${dateObj.getDate()}일 ${hour}시`,
        temp: convertTemp(hourly.temperature_2m[idx]),
        code: hourly.weather_code ? hourly.weather_code[idx] : 0,
      })
    }

    return selectedPoints
  }, [hourly, tempUnit])

  if (chartData.length === 0) return null

  // SVG 좌표 계산
  const temps = chartData.map((d) => d.temp)
  const minTemp = Math.min(...temps)
  const maxTemp = Math.max(...temps)
  const tempRange = Math.max(maxTemp - minTemp, 4) // 최소 4도 차이 유지

  const pointWidth = 56
  const chartHeight = 170
  const paddingTop = 45
  const paddingBottom = 45
  const usableHeight = chartHeight - paddingTop - paddingBottom
  const totalWidth = Math.max(chartData.length * pointWidth, 600)

  const points = chartData.map((d, i) => {
    const x = i * pointWidth + pointWidth / 2
    const y = paddingTop + usableHeight - ((d.temp - minTemp) / tempRange) * usableHeight
    return { ...d, x, y }
  })

  // 꺾은선 좌표 경로
  const pathD = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`
    return `${acc} L ${p.x} ${p.y}`
  }, '')

  // 그라데이션 영역 채우기 경로
  const areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight - 15} L ${points[0].x} ${chartHeight - 15} Z`

  return (
    <article className="card hourly-chart-card">
      <div className="card-top">
        <div>
          <span className="card-badge">24시간 예보</span>
          <h2 className="city-heading">시간대별 기온 변화 (°{tempUnit})</h2>
        </div>
        <div className="chart-header-hint">
          <Clock size={16} />
          <span>향후 24시간 추이</span>
        </div>
      </div>

      <p className="chart-description">
        오늘 하루 동안의 실시간 기온 흐름입니다. 좌우로 스크롤하여 시간대별 날씨와 기온을 확인하세요.
      </p>

      <div className="svg-chart-container">
        <svg
          className="hourly-svg"
          viewBox={`0 0 ${totalWidth} ${chartHeight}`}
          width={totalWidth}
          height={chartHeight}
        >
          <defs>
            <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* 그라데이션 영역 */}
          <path d={areaD} fill="url(#tempGradient)" />

          {/* 꺾은선 */}
          <path
            d={pathD}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 데이터 포인트 & 텍스트 */}
          {points.map((p, idx) => {
            const weather = getWeatherInfo(p.code)
            return (
              <g key={idx} className="chart-point-group">
                {/* 기온 수치 텍스트 */}
                <text
                  x={p.x}
                  y={p.y - 12}
                  textAnchor="middle"
                  className="chart-temp-text"
                  fill="var(--text-h)"
                >
                  {p.temp}°
                </text>

                {/* 점 표시 */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="4.5"
                  className="chart-dot"
                  fill="#ffffff"
                  stroke="var(--accent)"
                  strokeWidth="2.5"
                />

                {/* 날씨 미니 아이콘 */}
                <foreignObject x={p.x - 10} y={chartHeight - 40} width="20" height="20">
                  <div className="mini-weather-icon">
                    <WeatherIcon name={weather.icon} size={15} color={weather.color} />
                  </div>
                </foreignObject>

                {/* 시간 레이블 */}
                <text
                  x={p.x}
                  y={chartHeight - 6}
                  textAnchor="middle"
                  className={`chart-time-text ${p.time === '지금' ? 'now' : ''}`}
                  fill={p.time === '지금' ? 'var(--accent)' : 'var(--text)'}
                >
                  {p.time}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </article>
  )
}

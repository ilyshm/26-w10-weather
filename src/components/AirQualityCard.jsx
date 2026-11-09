import { Activity } from 'lucide-react'

export default function AirQualityCard({ current, airStatus }) {
  if (!current) return null

  return (
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
          <div className="stat-number">{Math.round(current.pm10)}</div>
          <div className="stat-guide">
            <span>기준: 0~30 좋음 / 81~ 나쁨</span>
          </div>
        </div>

        <div className="air-stat-box">
          <div className="stat-header">
            <span className="stat-name">초미세먼지 (PM2.5)</span>
            <span className="stat-tag">μg/m³</span>
          </div>
          <div className="stat-number">{Math.round(current.pm2_5)}</div>
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
  )
}


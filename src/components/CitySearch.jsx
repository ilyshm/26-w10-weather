import { useState, useEffect, useRef } from 'react'
import { Search, Loader2, X, MapPin } from 'lucide-react'
import { searchCities } from '../api/weather'

export default function CitySearch({ onSelectCity }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef(null)

  // 400ms 디바운스(Debounce) 적용
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    const timer = setTimeout(async () => {
      try {
        const data = await searchCities(query)
        setResults(data)
        setIsOpen(true)
      } catch (err) {
        console.error('검색 실패:', err)
        setResults([])
      } finally {
        setIsSearching(false)
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [query])

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (item) => {
    const region = item.admin1 ? ` (${item.admin1})` : ''
    const country = item.country ? `, ${item.country}` : ''
    const formattedName = `${item.name}${region}${country}`

    onSelectCity({
      name: formattedName,
      lat: item.latitude,
      lon: item.longitude,
    })

    setIsOpen(false)
    setQuery('')
    setResults([])
  }

  const handleClear = () => {
    setQuery('')
    setResults([])
    setIsOpen(false)
  }

  return (
    <div className="city-search-container" ref={wrapperRef}>
      <div className="search-input-wrapper">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="전 세계 도시 검색 (영문 예: Seoul, Tokyo, London, Paris)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
        />
        {isSearching && <Loader2 size={18} className="search-status-icon spinning" />}
        {!isSearching && query.length > 0 && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={handleClear}
            title="검색어 지우기"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* 드롭다운 결과 */}
      {isOpen && (
        <div className="search-dropdown">
          {results.length > 0 ? (
            <ul className="search-results-list">
              {results.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className="search-result-item"
                    onClick={() => handleSelect(item)}
                  >
                    <MapPin size={16} className="item-icon" />
                    <div className="item-details">
                      <span className="item-main-name">{item.name}</span>
                      <span className="item-sub-name">
                        {[item.admin1, item.country].filter(Boolean).join(', ')}
                      </span>
                    </div>
                    <span className="item-coord">
                      {item.latitude.toFixed(2)}°, {item.longitude.toFixed(2)}°
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            query.trim().length >= 2 && !isSearching && (
              <div className="search-no-results">
                검색된 도시가 없습니다. 영문 도시명(예: Tokyo, New York)으로 검색해 보세요.
              </div>
            )
          )}
        </div>
      )}
    </div>
  )
}


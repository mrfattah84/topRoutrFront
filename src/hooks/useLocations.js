import { useCallback, useEffect, useMemo, useState } from 'react'

const FALLBACK_COORDINATE = { lat: 35.6892, lng: 51.389 } // Tehran as default

// TODO: Swap MOCK_LOCATIONS for a live fetch via fetchLocations()
// once the backend API becomes available.

const MOCK_LOCATIONS = [
  {
    id: 'tehran-zone',
    name: 'Tehran Zone',
    latitude: 35.6892,
    longitude: 51.389,
    status: 'active',
    description: 'Coverage area focused on Tehran metropolitan region.',
  },
]

const toNumberOrNull = (value) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

const normalizeLocation = (item, index) => {
  const latitude = toNumberOrNull(item.latitude ?? item.lat ?? item?.geom?.coordinates?.[1])
  const longitude = toNumberOrNull(item.longitude ?? item.lng ?? item?.geom?.coordinates?.[0])

  return {
    id: item.id ?? `loc-${index}`,
    name: item.name ?? item.title ?? `Location ${index + 1}`,
    latitude: latitude ?? FALLBACK_COORDINATE.lat,
    longitude: longitude ?? FALLBACK_COORDINATE.lng,
    status: item.status ?? item.state ?? 'unknown',
    description: item.description ?? item.details ?? '',
    raw: item,
  }
}

export function useLocations(initialFilters = {}) {
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState(initialFilters)
  const [locations, setLocations] = useState([])

  const loadMockLocations = useCallback(() => {
    setStatus('loading')
    setError(null)

    const timer = setTimeout(() => {
      setLocations(MOCK_LOCATIONS.map(normalizeLocation))
      setStatus('success')
    }, 250)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const cleanup = loadMockLocations()
    return cleanup
  }, [loadMockLocations, filters])

  const refresh = useCallback(() => {
    loadMockLocations()
  }, [loadMockLocations])

  return useMemo(
    () => ({
      locations,
      status,
      error,
      filters,
      setFilters,
      refresh,
    }),
    [locations, status, error, filters, refresh],
  )
}


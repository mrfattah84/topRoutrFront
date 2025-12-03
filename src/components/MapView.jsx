import { useRef, useEffect, useMemo, useState, useCallback } from 'react'
import { Map, Marker, Popup } from 'react-map-gl/maplibre'
import PropTypes from 'prop-types'
import 'maplibre-gl/dist/maplibre-gl.css'

const DEFAULT_CENTER = [51.389, 35.6892] // Tehran default [lng, lat] for MapLibre
const DEFAULT_ZOOM = 10

// MapLibre style URL - Using OpenStreetMap compatible style
// For Persian/Farsi labels, you can use MapTiler or custom style with Persian tiles
// This style supports multilingual labels including Persian
const MAP_STYLE = {
  version: 8,
  sources: {
    'raster-tiles': {
      type: 'raster',
      tiles: [
        'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
      ],
      tileSize: 256,
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }
  },
  layers: [
    {
      id: 'simple-tiles',
      type: 'raster',
      source: 'raster-tiles',
      minzoom: 0,
      maxzoom: 22
    }
  ]
}

function MapView({ center = DEFAULT_CENTER, markers = [], loading = false, onMarkerSelect, selectedId }) {
  const mapRef = useRef(null)
  const zoom = selectedId ? 12 : DEFAULT_ZOOM
  const [viewState, setViewState] = useState({
    longitude: center[0],
    latitude: center[1],
    zoom: zoom,
  })
  const [popupInfo, setPopupInfo] = useState(null)

  // Update view state when center or zoom changes
  useEffect(() => {
    if (center && center.length === 2) {
      setViewState((prev) => ({
        ...prev,
        longitude: center[0],
        latitude: center[1],
        zoom: zoom,
      }))
    }
  }, [center, zoom])

  const markerList = useMemo(
    () =>
      markers.map((marker) => {
        const position = Array.isArray(marker.position)
          ? marker.position
          : marker.latitude !== undefined && marker.longitude !== undefined
            ? [marker.longitude, marker.latitude] // MapLibre uses [lng, lat]
            : [DEFAULT_CENTER[0], DEFAULT_CENTER[1]]

        return {
          ...marker,
          position: position,
          lng: position[0],
          lat: position[1],
        }
      }),
    [markers],
  )

  const handleMarkerClick = useCallback(
    (marker) => {
      setPopupInfo(marker)
      onMarkerSelect?.(marker.id)
    },
    [onMarkerSelect],
  )

  const handleClosePopup = useCallback(() => {
    setPopupInfo(null)
  }, [])

  return (
    <div className="map-container">
      {loading && <div className="map-overlay">Loading map data…</div>}
      {!loading && markerList.length === 0 && <div className="map-overlay">No locations yet</div>}

      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        style={{ width: '100%', height: '100%' }}
        mapStyle={MAP_STYLE}
        attributionControl={true}
        scrollZoom={true}
        doubleClickZoom={true}
        dragRotate={false}
        touchZoomRotate={true}
      >
        {markerList.map((marker) => (
          <Marker
            key={marker.id ?? `${marker.lng}-${marker.lat}`}
            longitude={marker.lng}
            latitude={marker.lat}
            anchor="bottom"
            onClick={() => handleMarkerClick(marker)}
          >
            <div
              className={`map-marker ${selectedId === marker.id ? 'map-marker-selected' : ''}`}
              style={{
                cursor: 'pointer',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: selectedId === marker.id ? '#36d4c0' : '#0A214A',
                border: '3px solid white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="white"
                style={{ pointerEvents: 'none' }}
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
            </div>
          </Marker>
        ))}

        {popupInfo && (
          <Popup
            longitude={popupInfo.lng}
            latitude={popupInfo.lat}
            anchor="bottom"
            onClose={handleClosePopup}
            closeButton={true}
            closeOnClick={false}
          >
            <div className="popup">
              <strong>{popupInfo.name}</strong>
              {popupInfo.description && <p>{popupInfo.description}</p>}
              <small>Status: {popupInfo.status ?? 'unknown'}</small>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  )
}

MapView.propTypes = {
  center: PropTypes.arrayOf(PropTypes.number),
  markers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string,
      position: PropTypes.arrayOf(PropTypes.number),
      latitude: PropTypes.number,
      longitude: PropTypes.number,
      status: PropTypes.string,
      description: PropTypes.string,
    }),
  ),
  loading: PropTypes.bool,
  onMarkerSelect: PropTypes.func,
  selectedId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
}

export default MapView

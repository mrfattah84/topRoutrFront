import { useEffect, useMemo, useState } from "react";
import "../App.css";
import MapView from "../components/MapView";
import TopNavigation from "../components/TopNavigation";
import PersianCalendar from "../components/PersianCalendar";
import { useLocations } from "../hooks/useLocations";
import jalaali from "jalaali-js";
import logoImage from "../assets/top-route-final-2.png";
import iconFile from "../assets/top-route-final-3.png";
import iconDoc from "../assets/top-route-final-4.png";
import iconChart from "../assets/top-route-final-6.png";
import iconUser from "../assets/top-route-final-7.png";

// Default center: Tehran [longitude, latitude] for MapLibre
const DEFAULT_CENTER = [51.389, 35.6892];

const NAV_ITEMS = [
  {
    id: "data",
    label: "Data",
    icon: "file",
    expanded: true,
    subItems: [
      { id: "calendar", label: "Calendar" },
      { id: "fleet", label: "Fleet" },
      { id: "order", label: "Order" },
    ],
  },
  { id: "result", label: "Result", icon: "doc" },
  { id: "live", label: "Live", icon: "compass" },
  { id: "analytics", label: "Analytics", icon: "chart" },
  { id: "admiration", label: "Admiration", icon: "user" },
];

const ICONS = {
  file: (
    <div className="nav-icon-img-container">
      <img src={iconFile} alt="Data" className="nav-icon-img" />
    </div>
  ),
  doc: (
    <div className="nav-icon-img-container">
      <img src={iconDoc} alt="Result" className="nav-icon-img" />
    </div>
  ),
  compass: (
    <div className="nav-icon-img-container">
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        className="nav-icon-svg"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
        <path d="M12 2v4M12 18v4M2 12h4M18 12h4" strokeLinecap="round" />
      </svg>
    </div>
  ),
  chart: (
    <div className="nav-icon-img-container">
      <img src={iconChart} alt="Analytics" className="nav-icon-img" />
    </div>
  ),
  user: (
    <div className="nav-icon-img-container">
      <img src={iconUser} alt="Admiration" className="nav-icon-img" />
    </div>
  ),
};

function MapPage() {
  const { locations, status, error, refresh } = useLocations();
  const [selectedId, setSelectedId] = useState(null);
  const [expandedMenu, setExpandedMenu] = useState("data");
  const [selectedSubMenu, setSelectedSubMenu] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    if (!selectedId && locations.length > 0) {
      setSelectedId(locations[0].id);
    }
  }, [locations, selectedId]);

  const selectedLocation = useMemo(
    () => locations.find((location) => location.id === selectedId) ?? null,
    [locations, selectedId]
  );

  // MapLibre uses [longitude, latitude] format
  const mapCenter = selectedLocation
    ? [selectedLocation.longitude, selectedLocation.latitude]
    : DEFAULT_CENTER;

  const markers = useMemo(
    () =>
      locations.map((location) => ({
        id: location.id,
        name: location.name,
        position: [location.latitude, location.longitude],
        status: location.status,
        description: location.description,
      })),
    [locations]
  );

  return (
    <div className="home-shell">
      <aside className="home-sidebar">
        <nav className="sidebar-nav">
          <img src={logoImage} alt="Top Route" className="logo-image" />
          {NAV_ITEMS.map((item) => {
            const isExpanded = expandedMenu === item.id && item.subItems;
            const hasSubItems = item.subItems && item.subItems.length > 0;

            return (
              <div key={item.id} className="nav-item-wrapper">
                <button
                  type="button"
                  className={`nav-item ${isExpanded ? "active" : ""}`}
                  onClick={() => {
                    if (hasSubItems) {
                      setExpandedMenu(isExpanded ? "" : item.id);
                    }
                  }}
                >
                  <span className="nav-icon">{ICONS[item.icon]}</span>
                  <span className="nav-text">
                    {item.label}
                    {item.caption && <small>{item.caption}</small>}
                  </span>
                  {hasSubItems && (
                    <span
                      className={`nav-chevron ${isExpanded ? "expanded" : ""}`}
                      aria-hidden="true"
                    >
                      ›
                    </span>
                  )}
                </button>
                {isExpanded && item.subItems && (
                  <div className="nav-submenu">
                    {item.subItems.map((subItem) => (
                      <button
                        key={subItem.id}
                        type="button"
                        className={`nav-subitem ${
                          selectedSubMenu === subItem.id ? "active" : ""
                        }`}
                        onClick={() => setSelectedSubMenu(subItem.id)}
                      >
                        {subItem.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      <div className="home-main">
        <TopNavigation />
        <div className="home-content">
          {error && (
            <div className="panel-error soft">
              <strong>Could not load locations.</strong>
              <p>{error.message}</p>
            </div>
          )}
          <div className="home-map-card">
            <MapView
              center={mapCenter}
              markers={markers}
              loading={status === "loading"}
              onMarkerSelect={setSelectedId}
              selectedId={selectedId}
            />
            {selectedSubMenu === "calendar" && (
              <div className="calendar-overlay">
                <PersianCalendar
                  onDateSelect={(date, jalaaliDate) => {
                    setSelectedDate(jalaaliDate);
                    console.log("Selected date:", date, jalaaliDate);
                  }}
                  selectedDate={selectedDate}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MapPage;

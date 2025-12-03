import PropTypes from 'prop-types'

function StatusPill({ status }) {
  const value = status?.toLowerCase() ?? 'unknown'
  const label = value.replace(/[-_]/g, ' ')
  const value = status?.toLowerCase() ?? 'unknown';
  const label = value.replace(/[-_]/g, ' ');

  return <span className={`status-pill status-${value}`}>{label}</span>
  const statusClasses = {
    active: 'bg-[rgba(76,255,177,0.15)] text-[#7bf4b1]',
    inactive: 'bg-[rgba(255,181,76,0.15)] text-[#ffd7a1]',
    unknown: 'bg-[rgba(255,255,255,0.15)] text-[#cfd8ff]',
  };

  return (
    <span
      className={`text-xs rounded-full py-1 px-3 uppercase tracking-[.08em] ${
        statusClasses[value] || statusClasses.unknown
      }`}
    >
      {label}
    </span>
  );
}

StatusPill.propTypes = {
  status: PropTypes.string.isRequired,
}

function LocationsPanel({ locations, status, error, onRefresh, onSelect, selectedId }) {
  return (
    <div className="locations-panel">
      <header>
    <div className="flex flex-col gap-6 h-full">
      <header className="flex justify-between items-center gap-4">
        <div>
          <p className="eyebrow">Data source</p>
          <h2>Locations</h2>
          <p className="m-0 text-xs uppercase tracking-[.15rem] text-[rgba(230,236,255,0.6)]">
            Data source
          </p>
          <h2 className="font-normal text-3xl pt-7 my-9">Locations</h2>
        </div>
        <button type="button" onClick={onRefresh} disabled={status === 'loading'}>
        <button
          type="button"
          onClick={onRefresh}
          disabled={status === 'loading'}
          className="rounded-full border-none py-2.5 px-5 bg-[#5b8dff] text-[#05070f] font-semibold disabled:opacity-50"
        >
          {status === 'loading' ? 'Loading…' : 'Refresh'}
        </button>
      </header>

      {error && (
        <div className="panel-error">
        <div className="border border-[rgba(255,102,102,0.4)] bg-[rgba(255,102,102,0.1)] rounded-xl p-4">
          <strong>Could not load locations.</strong>
          <p>{error.message}</p>
        </div>
      )}

      <ul>
      <ul className="list-none p-0 m-0 flex flex-col gap-4">
        {locations.map((location) => (
          <li
            key={location.id}
            onClick={() => onSelect?.(location.id)}
            className={selectedId === location.id ? 'selected' : undefined}
            className={`border rounded-xl p-4 cursor-pointer transition-colors duration-200 ease-in-out ${
              selectedId === location.id
                ? 'border-[#5b8dff] bg-[rgba(91,141,255,0.06)]'
                : 'border-[rgba(230,236,255,0.1)]'
            }`}
          >
            <div className="row">
            <div className="flex justify-between items-center gap-2">
              <strong>{location.name}</strong>
              <StatusPill status={location.status} />
            </div>
            <p>{location.description || 'No description available.'}</p>
          </li>
        ))}
      </ul>

      {status === 'success' && locations.length === 0 && <p className="empty-state">No locations found.</p>}
      {status === 'success' && locations.length === 0 && (
        <p className="text-[rgba(230,236,255,0.7)] italic">
          No locations found.
        </p>
      )}
    </div>
  )
}

LocationsPanel.propTypes = {
  locations: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string,
      description: PropTypes.string,
      status: PropTypes.string,
    }),
  ),
  status: PropTypes.string,
  error: PropTypes.instanceOf(Error),
  onRefresh: PropTypes.func,
  onSelect: PropTypes.func,
  selectedId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
}

export default LocationsPanel


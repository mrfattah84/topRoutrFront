// Shared vehicle color palette for consistent colors across components
export const getVehicleColors = (index) => {
  const vehicleColors = [
    { primary: '#3b82f6', secondary: '#dbeafe' }, // Blue
    { primary: '#10b981', secondary: '#d1fae5' }, // Green
    { primary: '#f59e0b', secondary: '#fef3c7' }, // Orange
    { primary: '#8b5cf6', secondary: '#ede9fe' }, // Purple
    { primary: '#ef4444', secondary: '#fee2e2' }, // Red
  ]
  return vehicleColors[index % vehicleColors.length]
}

// Get primary color for route lines
export const getVehicleRouteColor = (index) => {
  const colors = getVehicleColors(index)
  return colors.primary
}


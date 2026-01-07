interface ColorTheme {
  primary: string;
  secondary: string;
}

export const generateUserColor = (userId: string): ColorTheme => {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Generate a Hue between 0 and 360 based on the hash
  const h = Math.abs(hash) % 360;
  
  // Define fixed Saturation and Lightness for consistency
  // Primary: S=70%, L=50% (Vibrant)
  // Secondary: S=70%, L=90% (Pastel/Background)
  return {
    primary: hslToHex(h, 70, 50),
    secondary: hslToHex(h, 70, 90),
  };
};

// Helper function to convert HSL to Hex
const hslToHex = (h: number, s: number, l: number): string => {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0"); // convert to Hex and pad with 0
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};
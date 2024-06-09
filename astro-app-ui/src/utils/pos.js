export function renderAz(az) {
  let azStr = "";
  if (az >= 337.5 || az < 22.5) {
    azStr = "N";
  } else if (az >= 22.5 && az < 67.5) {
    azStr = "NE";
  } else if (az >= 67.5 && az < 112.5) {
    azStr = "E";
  } else if (az >= 112.5 && az < 157.5) {
    azStr = "SE";
  } else if (az >= 157.5 && az < 202.5) {
    azStr = "S";
  } else if (az >= 202.5 && az < 247.5) {
    azStr = "SW";
  } else if (az >= 247.5 && az < 292.5) {
    azStr = "W";
  } else if (az >= 292.5 && az < 337.5) {
    azStr = "NW";
  }
  return `${az}° ${azStr}`;
}

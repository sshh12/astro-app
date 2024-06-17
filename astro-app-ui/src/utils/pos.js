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

export function getDeviceLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({ error: "Geolocation not supported" });
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (error) => {
        let errorName = "";
        if (error.code === error.PERMISSION_DENIED) {
          errorName = "Permission Denied";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorName = "Position Unavailable";
        } else if (error.code === error.TIMEOUT) {
          errorName = "Timeout";
        }
        reject({ error: errorName });
      }
    );
  });
}

export function geocodeLocationToName(geocodeLocation) {
  const address = geocodeLocation.address;
  const country = address.country;
  const city =
    address.city ||
    address.town ||
    address.village ||
    address.county ||
    address.state ||
    "Location";
  return `${city}, ${country}`;
}

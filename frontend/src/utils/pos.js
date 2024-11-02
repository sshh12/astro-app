import pako from "pako";
import L from "leaflet";

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

export function renderLatLon(lat, lon) {
  const latStr = lat >= 0 ? `${lat.toFixed(2)}° N` : `${-lat.toFixed(2)}° S`;
  const lonStr = lon >= 0 ? `${lon.toFixed(2)}° E` : `${-lon.toFixed(2)}° W`;
  return `${latStr} / ${lonStr}`;
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

export async function fetchLPData(location, cacheStore) {
  const { lat, lon } = location;
  const compressed2full = (x) => {
    return (5.0 / 195.0) * (Math.exp(0.0195 * x) - 1.0);
  };
  const key = `lp:${lat}-${lon}`;
  const cached = await cacheStore.getItem(key);
  if (cached) {
    return cached;
  }
  const lonFromDateLine = (lon + 180.0) % 360.0;
  const latFromStart = lat + 65.0;
  const tileX = Math.floor(lonFromDateLine / 5.0) + 1;
  const tileY = Math.floor(latFromStart / 5.0) + 1;
  if (tileY < 1 || tileY > 28) {
    return;
  }
  const url = `/lp/binary/binary_tile_${tileX}_${tileY}.dat.gz`;
  const ix = Math.round(
    120.0 * (lonFromDateLine - 5.0 * (tileX - 1) + 1.0 / 240.0)
  );
  const iy = Math.round(
    120.0 * (latFromStart - 5.0 * (tileY - 1) + 1.0 / 240.0)
  );
  const resp = await fetch(url);
  const data = await resp.arrayBuffer();
  const data_array = new Int8Array(pako.ungzip(data));
  const first_number = 128 * data_array[0] + data_array[1];
  let change = 0.0;
  for (let i = 1; i < iy; i++) {
    change += data_array[600 * i + 1];
  }
  for (let i = 1; i < ix; i++) {
    change += data_array[600 * (iy - 1) + 1 + i];
  }
  const compressed = first_number + change;
  const brightnessRatio = compressed2full(compressed);
  const mpsas =
    22.0 - (5.0 * Math.log(1.0 + brightnessRatio)) / Math.log(100.0);
  const lp = {
    brightnessRatio,
    mpsas,
    lat,
    lon,
  };
  await cacheStore.setItem(key, lp);
  return lp;
}

const BORTLE_TABLE = [
  {
    bortle: 1,
    nelm: [7.6, 8.0],
    sqm: [21.76, 30.0],
    recommendations:
      "Ideal for observing faint celestial objects such as the zodiacal light, gegenschein, and the zodiacal band. Explore the Milky Way in the Scorpius and Sagittarius regions, where it casts shadows. Look for many Messier and globular clusters with the naked eye. M33 (the Triangulum Galaxy) is also visible without optical aid.",
  },
  {
    bortle: 2,
    nelm: [7.1, 7.5],
    sqm: [21.6, 21.75],
    recommendations:
      "Good for observing the zodiacal light, which appears distinctly yellowish. The gegenschein and structured summer Milky Way are visible. Many Messier objects and globular clusters can be seen with the naked eye. M33 is easily visible without optical aid.",
  },
  {
    bortle: 3,
    nelm: [6.6, 7.0],
    sqm: [21.3, 21.6],
    recommendations:
      "Suitable for observing the zodiacal light in spring and autumn. The summer Milky Way still shows complexity. Naked-eye observation of M15, M4, M5, and M22 is possible. M33 can be seen with averted vision.",
  },
  {
    bortle: 4,
    nelm: [6.3, 6.5],
    sqm: [20.8, 21.3],
    recommendations:
      "Observe the zodiacal light, though less extensive. The Milky Way is still impressive above the horizon. M33 becomes a challenging object, best seen when high in the sky.",
  },
  {
    bortle: 4.5,
    nelm: [6.1, 6.3],
    sqm: [20.3, 20.8],
    recommendations:
      "The Milky Way is vaguely visible. Focus on the Great Rift when it is overhead. Bright globular clusters are still striking through larger telescopes, but outer regions of galaxies are challenging.",
  },
  {
    bortle: 5,
    nelm: [5.6, 6.0],
    sqm: [19.25, 20.3],
    recommendations:
      "Zodiacal light is only hinted at on the best nights. The Milky Way appears washed out. This environment is suitable for observing brighter celestial objects and the effects of light pollution.",
  },
  {
    bortle: 6,
    nelm: [5.1, 5.5],
    sqm: [18.5, 19.25],
    recommendations:
      "Focus on brighter objects such as planets and some Messier objects. The Milky Way is only visible near the zenith. M31 is modestly apparent.",
  },
  {
    bortle: 7,
    nelm: [4.6, 5.0],
    sqm: [18.0, 18.5],
    recommendations:
      "Light pollution is significant. Observe brighter celestial objects and planets. M31 and M44 may be glimpsed with effort.",
  },
  {
    bortle: 8,
    nelm: [4.1, 4.5],
    sqm: [17.0, 18.0],
    recommendations:
      "The sky is significantly affected by light pollution. Focus on the brightest objects in the sky, such as the Moon and planets. Only the brightest Messier objects are detectable with a telescope.",
  },
  {
    bortle: 9,
    nelm: [4.0, 4.0],
    sqm: [0.0, 17.0],
    recommendations:
      "The sky is extremely bright due to urban lighting. Limited to observing the Moon, planets, bright satellites, and a few of the brightest star clusters.",
  },
];

export function getLPDetails({ skyBrightness }) {
  const lpDetails = BORTLE_TABLE.find((entry) => {
    return entry.sqm[0] <= skyBrightness && skyBrightness <= entry.sqm[1];
  });
  const pRange =
    (skyBrightness - lpDetails.sqm[0]) / (lpDetails.sqm[1] - lpDetails.sqm[0]);
  lpDetails.nelmApprox =
    lpDetails.nelm[0] + pRange * (lpDetails.nelm[1] - lpDetails.nelm[0]);
  return lpDetails;
}

export let CURRENT_ICON = new L.Icon({
  iconUrl: "/static/map/current.svg",
  iconRetinaUrl: "/static/map/current.svg",
  iconSize: new L.Point(30, 30),
  className: "leaflet-div-icon",
});

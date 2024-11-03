import { useEffect, useId, useRef } from "react";
import { colorToHex } from "../constants/colors";
import { useCachedPythonOutput } from "../contexts/python";
import { useTimestamp } from "../utils/date";
import { objectsToKey } from "../utils/object";
import { getImageURL } from "./SkyObjectImage";

export default function VirtualSky({ objects }) {
  const location = null;
  const id = useId().replaceAll(":", "");
  const planetariumRef = useRef(null);

  const { ts } = useTimestamp();
  const tsRounded = Math.floor(ts / 30000) * 30000;
  const { result: orbitsNow } = useCachedPythonOutput(
    "get_position_at_time",
    objects &&
      location && {
        objects: objects,
        start_ts: tsRounded,
        timezone: location.timezone,
        lat: location.lat,
        lon: location.lon,
        elevation: location.elevation,
      },
    {
      cacheKey: `obj_pos_${tsRounded}_${location?.id}_${objectsToKey(objects)}`,
      staleCacheKey: `obj_pos_${objectsToKey(objects)}`,
    }
  );

  useEffect(() => {
    const planetarium = window.S.virtualsky({
      id: id,
      projection: "stereo",
      cardinalpoints: true,
      showdate: false,
      showposition: false,
      longitude: location.lon,
      latitude: location.lat,
      constellations: true,
      showplanets: false,
      keyboard: false,
    });
    planetariumRef.current = planetarium;
  }, [location, id]);

  useEffect(() => {
    if (!location || !planetariumRef.current || !objects) return;
    planetariumRef.current.pointers = [];
    objects.forEach((obj) => {
      const pos = orbitsNow && orbitsNow[obj.id];
      if (!pos) {
        return;
      }
      planetariumRef.current.addPointer({
        ra: pos.ra * 15,
        dec: pos.dec,
        label: obj.name,
        colour: colorToHex(obj.color),
        img: getImageURL(obj),
        url: "/sky/object/" + obj.id,
        credit: obj.name,
      });
    });
  }, [id, location, objects, orbitsNow, planetariumRef]);
  return <div id={id} style={{ width: "100%", height: "17.5rem" }}></div>;
}

import { useEffect, useId } from "react";
import { useBackend } from "./../providers/backend";
import { colorToHex } from "../constants/colors";
import { getImageURL } from "./SkyObjectImage";

export default function VirtualSky({ objects }) {
  const { location } = useBackend();
  const id = useId().replaceAll(":", "");
  useEffect(() => {
    if (!location) return;
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
    if (objects) {
      objects.forEach((obj) => {
        planetarium.addPointer({
          ra: obj.ra * 15,
          dec: obj.dec,
          label: obj.name,
          colour: colorToHex(obj.color),
          img: getImageURL(obj),
          url: "/sky/object/" + obj.id,
          credit: "HIPS2FITS",
        });
      });
    }
  }, [id, location, objects]);
  return <div id={id} style={{ width: "100%", height: "17.5rem" }}></div>;
}

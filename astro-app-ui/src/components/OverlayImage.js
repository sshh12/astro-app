import React, { useRef, useMemo } from "react";
import { colorToHex } from "../constants/colors";
import {
  MapContainer,
  ImageOverlay,
  Circle,
  Tooltip,
  Popup,
} from "react-leaflet";
import L from "leaflet";
import SkyObjectCard from "./SkyObjectCard";

const SCALE = 300;
const pixelScaleOffset = 1;

export default function OverlayImage({ image, objects }) {
  const mapRef = useRef(null);

  const elems = useMemo(() => {
    if (!image || !objects) {
      return [];
    }
    const aspectRatio = image.widthPx / image.heightPx;
    const objSizes = objects.map((o) => o.sizeMajor || 1).sort((a, b) => b - a);
    const top10Size = objSizes.slice(0, 10).at(-1);
    return (image?.mappedObjs || []).map((map) => {
      const [objId, x, y] = map;
      const obj = objects.find((o) => o.id === objId);
      const size =
        obj.sizeMajor * (1 / image.pixelScale) * pixelScaleOffset || 1;
      const posX = (1 - y / image.heightPx) * SCALE;
      const posY = (x / image.widthPx) * SCALE * aspectRatio;
      return (
        <Circle
          center={[posX, posY]}
          radius={size}
          pathOptions={{ color: colorToHex(obj.color), fillOpacity: 0 }}
          key={obj.id}
        >
          <Tooltip offset={[0, -10]} permanent={obj.sizeMajor > top10Size}>
            {obj.name}
          </Tooltip>
          <Popup className="obj-overlap-popup">
            <SkyObjectCard object={obj} />
          </Popup>
        </Circle>
      );
    });
  }, [image, objects]);

  if (!image) {
    return <></>;
  }
  const aspectRatio = image.widthPx / image.heightPx;
  const bounds = [
    [0, 0],
    [SCALE, SCALE * aspectRatio],
  ];
  const center = [bounds[1][0] / 2, bounds[1][1] / 2];
  return (
    <MapContainer
      crs={L.CRS.Simple}
      bounds={bounds}
      style={{ height: "36vh", width: "100%" }}
      ref={mapRef}
      center={center}
      zoom={0}
    >
      <ImageOverlay url={image.mainImageUrl} bounds={bounds} />
      {elems}
    </MapContainer>
  );
}

import React, { useState, useEffect } from "react";
import { useBackend } from "../providers/backend";
import { equipmentToDetails } from "../utils/equipment";

const HIPS2FITS_URL =
  "https://alasky.cds.unistra.fr/hips-image-services/hips2fits";

const OVERRIDES = [
  {
    id: "944241943363649537",
    imgURL: "/static/objects/944241943363649537.jpg",
    fill: "#010101",
  },
  {
    id: "944241943867162625",
    imgURL: "/static/objects/944241943867162625.jpg",
    fill: "#000000",
  },
  {
    id: "944241942959718401",
    imgURL: "/static/objects/944241942959718401.jpg",
    fill: "#000000",
  },
  {
    id: "944241943455465473",
    imgURL: "/static/objects/944241943455465473.jpg",
    fill: "#000000",
  },
  {
    id: "944241943171366913",
    imgURL: "/static/objects/944241943171366913.jpg",
    fill: "#000000",
  },
  {
    id: "944241943064412161",
    imgURL: "/static/objects/944241943064412161.jpg",
    fill: "#000000",
  },
  {
    id: "944241943273340929",
    imgURL: "/static/objects/944241943273340929.jpg",
    fill: "#000000",
  },
  {
    id: "944241943558094849",
    imgURL: "/static/objects/944241943558094849.jpg",
    fill: "#000000",
  },
  {
    id: "944241943667408897",
    imgURL: "/static/objects/944241943667408897.jpg",
    fill: "#000000",
  },
  {
    id: "944241943765680129",
    imgURL: "/static/objects/944241943765680129.jpg",
    fill: "#000000",
  },
];

function SkySurveyImage({ object, hips, width, height, style, fov = 1.0 }) {
  return (
    <img
      src={`${HIPS2FITS_URL}?hips=${hips}&width=${width}&height=${height}&fov=${fov}&projection=TAN&coordsys=icrs&rotation_angle=0.0&ra=${
        object.ra * 15
      }&dec=${object.dec}&format=jpg`}
      alt="Astro Survey"
      crossOrigin="anonymous"
      style={style}
    />
  );
}

function ImageWithBackgound({ src, width, height, alt, fill, scale, style }) {
  const [resizedImageDataUrl, setResizedImageDataUrl] = useState("");

  useEffect(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = width;
    canvas.height = height;
    ctx.fillStyle = fill;
    ctx.fillRect(0, 0, width, height);
    const image = new Image();
    image.src = src;

    image.onload = () => {
      const aspectRatio = image.width / image.height;
      let newWidth, newHeight;

      if (aspectRatio > 1) {
        newWidth = canvas.width * scale;
        newHeight = newWidth / aspectRatio;
      } else {
        newHeight = canvas.height * scale;
        newWidth = newHeight * aspectRatio;
      }

      newHeight = Math.max(1, newHeight);
      newWidth = Math.max(1, newWidth);

      ctx.drawImage(
        image,
        (canvas.width - newWidth) / 2,
        (canvas.height - newHeight) / 2,
        newWidth,
        newHeight
      );

      setResizedImageDataUrl(canvas.toDataURL());
    };
    image.onerror = (e) => {
      console.error("Image loading error:", e);
    };
  }, [src, width, height, scale, fill]);

  return <img src={resizedImageDataUrl} alt={alt} style={style} />;
}

export default function ObjectImage({ object, equipment = null }) {
  const { equipment: existingEquipment } = useBackend();
  const { width, height, fov } = equipmentToDetails(
    equipment || existingEquipment
  );
  const override = OVERRIDES.find((o) => o.id === object.id);
  const source = "CDS/P/DSS2/color";
  const imgStyle = {
    width: "100%",
  };
  if (source !== "wiki" && !!object.ra) {
    return (
      <SkySurveyImage
        object={object}
        hips={source}
        width={width}
        height={height}
        fov={fov}
        style={imgStyle}
      />
    );
  }
  if (source !== "wiki" && !object.ra && override && object.sizeMajor) {
    const scale = object.sizeMajor / 35 / fov;
    return (
      <ImageWithBackgound
        src={override.imgURL}
        width={width}
        height={height}
        alt={"image of " + object.name}
        fill={override.fill}
        scale={scale}
        style={imgStyle}
      />
    );
  }
  return (
    <ImageWithBackgound
      src={"/600.png"}
      width={width}
      height={height}
      alt={"image of " + object.name}
      fill={"#000000"}
      scale={0}
    />
  );
}

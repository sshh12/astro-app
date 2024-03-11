"use client";

import React, { useState, useEffect } from "react";
import SkySurveyImage from "./sky-survey-image";

const OVERRIDES = [
  {
    id: "944241943363649537",
    imgURL: "/object_icons/944241943363649537.jpg",
    fill: "#010101",
  },
  {
    id: "944241943867162625",
    imgURL: "/object_icons/944241943867162625.jpg",
    fill: "#000000",
  },
  {
    id: "944241942959718401",
    imgURL: "/object_icons/944241942959718401.jpg",
    fill: "#000000",
  },
  {
    id: "944241943455465473",
    imgURL: "/object_icons/944241943455465473.jpg",
    fill: "#000000",
  },
  {
    id: "944241943171366913",
    imgURL: "/object_icons/944241943171366913.jpg",
    fill: "#000000",
  },
  {
    id: "944241943064412161",
    imgURL: "/object_icons/944241943064412161.jpg",
    fill: "#000000",
  },
  {
    id: "944241943273340929",
    imgURL: "/object_icons/944241943273340929.jpg",
    fill: "#000000",
  },
  {
    id: "944241943558094849",
    imgURL: "/object_icons/944241943558094849.jpg",
    fill: "#000000",
  },
  {
    id: "944241943667408897",
    imgURL: "/object_icons/944241943667408897.jpg",
    fill: "#000000",
  },
  {
    id: "944241943765680129",
    imgURL: "/object_icons/944241943765680129.jpg",
    fill: "#000000",
  },
];

function ImageWithBackgound({ src, width, height, alt, fill, scale }) {
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
  }, [src, width, height, scale]);

  return (
    <img
      src={resizedImageDataUrl}
      alt={alt}
      style={{ width: "100%", height: "auto" }}
    />
  );
}

export default function ObjectImage({
  object,
  source,
  aspectRatio = 1.0,
  fov = 1.0,
  style = {},
}) {
  const override = OVERRIDES.find((o) => o.id === object.id);
  if (source != "wiki" && !!object.ra) {
    return (
      <SkySurveyImage
        object={object}
        hips={source}
        aspectRatio={aspectRatio}
        style={style}
        fov={fov}
      />
    );
  }
  if (source != "wiki" && !object.ra && override && object.sizeMajor) {
    const width = 1000;
    const scale = object.sizeMajor / 18 / fov;
    const height = Math.floor(width / aspectRatio);
    return (
      <ImageWithBackgound
        src={override.imgURL}
        width={width}
        height={height}
        alt={"image of " + object.name}
        fill={override.fill}
        scale={scale}
      />
    );
  }
  return (
    <img
      style={{ width: "100%", ...style }}
      src={object.imgURL || "/600.png"}
      alt={"image of " + object.name}
      crossorigin="anonymous"
    />
  );
}

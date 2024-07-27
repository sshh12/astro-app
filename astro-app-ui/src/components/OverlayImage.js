import React, { useRef, useEffect } from "react";
import { colorToHex } from "../constants/colors";

const pixelScaleOffset = 30;

export default function OverlayImage({ image, objects }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (!image) {
      return;
    }
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const cImg = new Image();

    cImg.src = image.mainImageUrl;
    cImg.onload = () => {
      canvas.width = cImg.width;
      canvas.height = cImg.height;
      ctx.drawImage(cImg, 0, 0);

      const fontSize = Math.max(Math.round(cImg.width / 80), 10);
      const lineWidth = Math.max(1, Math.round(cImg.width / 500));
      const minSize = Math.max(1, Math.round(cImg.width / 5000));

      const mappings = image?.mappedObjs || [];
      if (mappings.length !== objects?.length) {
        return;
      }
      mappings.forEach((map) => {
        const [objId, x, y] = map;
        const obj = objects.find((o) => o.id === objId);
        ctx.beginPath();
        const size = obj.sizeMajor || minSize;
        ctx.arc(
          x,
          y,
          size * (1 / image.pixelScale) * pixelScaleOffset,
          0,
          2 * Math.PI
        );
        ctx.strokeStyle = colorToHex(obj.color);
        ctx.lineWidth = lineWidth;
        ctx.stroke();

        ctx.font = `${fontSize}px Arial`;
        ctx.fillStyle = colorToHex(obj.color);
        ctx.textAlign = "center";
        ctx.fillText(
          obj.name,
          x,
          Math.max(
            fontSize,
            y - size * (1 / image.pixelScale) * pixelScaleOffset - 20
          )
        );
      });
    };
  }, [image, objects]);

  return <canvas ref={canvasRef} style={{ width: "100%", display: "block" }} />;
}

import React from "react";
import ObjectImage from "./object-image";
import { Grid } from "@tremor/react";

export default function SkyChartGallery({ objects }) {
  const numItems = objects.length;
  const colCount = (maxRowItems) => {
    if (numItems <= maxRowItems) {
      return numItems;
    }
    return maxRowItems;
  };
  return (
    <div style={{ height: "20rem" }} className="overflow-y-scroll">
      <Grid
        numItems={colCount(3)}
        numItemsSm={colCount(3)}
        numItemsMd={colCount(6)}
        numItemsLg={colCount(10)}
        className="mt-2 gap-1"
      >
        {objects.map((obj) => (
          <ObjectImage
            key={obj.id}
            object={obj.object}
            source="CDS/P/DSS2/color"
          />
        ))}
      </Grid>
    </div>
  );
}

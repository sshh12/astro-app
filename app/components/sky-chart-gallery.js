import React from "react";
import ObjectImage from "./object-image";
import { Grid } from "@tremor/react";

export default function SkyChartGallery({ objects }) {
  return (
    <div style={{ height: "20rem" }} className="overflow-y-scroll">
      <Grid
        numItems={3}
        numItemsSm={3}
        numItemsMd={6}
        numItemsLg={10}
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

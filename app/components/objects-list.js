"use client";

import React from "react";
import { Title, Grid } from "@tremor/react";
import ObjectCard from "./object-card";

export default function ObjectsList({ title, objects, orbits }) {
  return (
    <div>
      <div className="mt-5">
        <Title>{title}</Title>
      </div>
      <Grid numItemsMd={2} numItemsLg={3} className="mt-2 gap-1">
        {objects.map((obj) => (
          <ObjectCard key={obj.id} object={obj} orbits={orbits} />
        ))}
      </Grid>
    </div>
  );
}

"use client";

import React, { useMemo } from "react";
import { Title, Grid, Select, SelectItem } from "@tremor/react";
import ObjectCard from "./object-card";
import { useAPI } from "../api";
import { getMaxWhile } from "../utils";

const LIST_SORTS = [
  {
    id: "name",
    label: "Sort by name",
    sort: ({ a, b }) => a.name.localeCompare(b.name),
  },
  {
    id: "type",
    label: "Sort by type",
    sort: ({ a, b }) => a.type.localeCompare(b.type),
  },
  {
    id: "max-alt",
    label: "Sort by max altitude",
    sort: ({ a, b, orbits }) => {
      const orbitAltA = orbits.objects[a.id].alt;
      const [maxAltA] = getMaxWhile(
        orbitAltA,
        (i) => orbits.time_state[i] > 0 && orbits.time_state[i] < 7
      );
      const orbitAltB = orbits.objects[b.id].alt;
      const [maxAltB] = getMaxWhile(
        orbitAltB,
        (i) => orbits.time_state[i] > 0 && orbits.time_state[i] < 7
      );
      return maxAltB - maxAltA;
    },
  },
];

export default function ObjectsList({ title, objects, orbits }) {
  const { objectViewMode, setObjectViewMode } = useAPI();

  const fullSorts = useMemo(() => {
    return LIST_SORTS.concat(
      LIST_SORTS.map((s) => ({
        id: `${s.id}--desc`,
        label: `${s.label} (-)`,
        sort: (p) => -s.sort(p),
      }))
    ).sort((a, b) => a.label.localeCompare(b.label));
  }, []);

  const objectsSorted = useMemo(() => {
    const sortMode = fullSorts.find((s) => s.id === objectViewMode.sortMode);
    const objectsSorted = [...objects];
    objectsSorted.sort((a, b) => sortMode.sort({ a, b, orbits }));
    return objectsSorted;
  }, [objects, orbits, objectViewMode, fullSorts]);

  return (
    <div>
      <div className="mt-5">
        <Title>{title}</Title>
        <div className="w-24 mt-1">
          <Select
            enableClear={false}
            value={objectViewMode.sortMode}
            onChange={(v) =>
              setObjectViewMode({ ...objectViewMode, sortMode: v })
            }
          >
            {fullSorts.map((sort) => (
              <SelectItem key={sort.id} value={sort.id}>
                {sort.label}
              </SelectItem>
            ))}
          </Select>
        </div>
      </div>
      <Grid numItemsMd={2} numItemsLg={3} className="mt-2 gap-1">
        {objectsSorted.map((obj) => (
          <ObjectCard key={obj.id} object={obj} orbits={orbits} />
        ))}
      </Grid>
    </div>
  );
}

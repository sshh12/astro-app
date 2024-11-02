import React, { useMemo, useState } from "react";
import { OBJECT_FIELDS } from "../utils/object";
import SkyObjectCard from "./SkyObjectCard";
import SkyObjectDisplayModal from "./SkyObjectDisplayModal";

export default function SkyObjectsList({ objects, orbits }) {
  const displaySettings = null;
  const [displayModalOpen, setDisplayModalOpen] = useState(false);

  const objs = useMemo(() => {
    const objs = [...(objects || [])];
    const sortParams = displaySettings
      ? OBJECT_FIELDS.find((s) => s.id === displaySettings.sortName)
      : OBJECT_FIELDS[0];
    const multi = displaySettings?.sortReverse ? -1 : 1;
    objs.sort((a, b) => multi * sortParams.sort({ a, b, orbits }));
    return objs;
  }, [objects, displaySettings, orbits]);

  return (
    <>
      {objects &&
        objs.map((obj) => (
          <SkyObjectCard
            key={obj.id}
            object={obj}
            orbits={orbits}
            setDisplayModalOpen={setDisplayModalOpen}
          />
        ))}
      {!objects &&
        Array.from({ length: 8 }).map((_, i) => <SkyObjectCard key={i} />)}
      <SkyObjectDisplayModal
        open={displayModalOpen}
        setOpen={setDisplayModalOpen}
      />
    </>
  );
}

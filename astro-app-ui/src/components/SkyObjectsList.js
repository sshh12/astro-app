import React, { useMemo, useState } from "react";
import SkyObjectCard from "./SkyObjectCard";
import { OBJECT_SORTS } from "../utils/object";
import { useBackend } from "../providers/backend";
import SkyObjectDisplayModal from "./SkyObjectDisplayModal";

export default function SkyObjectsList({ objects, orbits }) {
  const { objDisplay } = useBackend();
  const [displayModalOpen, setDisplayModalOpen] = useState(true);

  const objs = useMemo(() => {
    const objs = [...(objects || [])];
    const sortParams = objDisplay
      ? OBJECT_SORTS.find((s) => s.id === objDisplay.sortName)
      : OBJECT_SORTS[0];
    const multi = objDisplay?.sortReverse ? -1 : 1;
    objs.sort((a, b) => multi * sortParams.sort({ a, b, orbits }));
    return objs;
  }, [objects, objDisplay, orbits]);

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

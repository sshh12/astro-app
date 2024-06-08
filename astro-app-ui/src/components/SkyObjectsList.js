import SkyObjectCard from "./SkyObjectCard";

export default function SkyObjectsList({ objects, orbits }) {
  const objs = objects || [];
  return (
    <>
      {objects &&
        objs.map((obj) => <SkyObjectCard key={obj.id} object={obj} />)}
      {!objects &&
        Array.from({ length: 10 }).map((_, i) => <SkyObjectCard key={i} />)}
    </>
  );
}

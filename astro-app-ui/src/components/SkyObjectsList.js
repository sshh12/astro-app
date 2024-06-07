import SkyObjectCard from "./SkyObjectCard";

export default function SkyObjectsList({ objects }) {
  const objs = objects || [];
  return (
    <>
      {objs.map((obj) => (
        <SkyObjectCard key={obj.id} object={obj} />
      ))}
    </>
  );
}

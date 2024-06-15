export function objectsToKey(objects) {
  if (objects) {
    const objectsSorted = objects.sort((a, b) => a.id - b.id);
    return objectsSorted.map((x) => x.id).join(",");
  } else {
    return "";
  }
}

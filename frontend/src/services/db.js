import Dexie from "dexie";

const db = new Dexie("AstroAppDB");

const USER_ID = "$CurrentUser";

db.version(1).stores({
  users:
    "id, remoteId, remoteSynced, onboarded, name, apiKey, listIds, equipmentIds, locationIds, imageIds, createdAt",
  locations:
    "id, remoteId, remoteSynced, active, name, lat, lon, elevation, timezone, createdAt",
});

function getRandomString(length) {
  return Math.random()
    .toString(36)
    .substring(2, length + 2);
}

function getRandomLocalId() {
  return getRandomString(16);
}

async function getUser() {
  return await db.users.get(USER_ID);
}

async function getLocations() {
  return await db.locations.toArray();
}

async function createDefaultLocation() {
  const location = {
    id: getRandomLocalId(),
    remoteId: null,
    remoteSynced: false,
    active: true,
    name: "Default Location",
    lat: 34.11833,
    lon: -118.300333,
    elevation: 0.0,
    timezone: "America/Los_Angeles",
  };
  await db.locations.put(location);
  return location;
}

async function createDefaultUser() {
  const location = await createDefaultLocation();
  const user = {
    id: USER_ID,
    remoteId: null,
    name: "astro-" + getRandomString(6),
    apiKey: getRandomString(16),
    createdAt: Date.now(),
    listIds: [],
    equipmentIds: [],
    locationIds: [location.id],
    imageIds: [],
    onboarded: false,
    remoteSynced: false,
  };
  await db.users.put(user);
  return user;
}

async function setOnboarded() {
  await db.users.update(USER_ID, { onboarded: true });
}

async function addLocation(locationDetails) {
  await db.locations.update("active", false);

  const location = { ...locationDetails };
  Object.assign(location, {
    id: getRandomLocalId(),
    remoteId: null,
    remoteSynced: false,
    active: true,
    createdAt: Date.now(),
  });
  await db.locations.put(location);

  const user = await db.users.get(USER_ID);
  await db.users.update(USER_ID, {
    locationIds: [...user.locationIds, location.id],
  });
  return location;
}

export {
  USER_ID,
  addLocation,
  createDefaultUser,
  db,
  getLocations,
  getUser,
  setOnboarded,
};

const POST_METHODS = {
  update_space_object_lists: async ({
    user,
    list_ids,
    new_list_title,
    object_id,
    objectStore,
    listStore,
  }) => {
    const obj = await objectStore.getItem(object_id);
    const createdLists =
      new_list_title.length > 0
        ? [
            {
              objects: [obj],
              title: new_list_title,
              color: "ORANGE",
              id: Math.random().toString(36),
            },
          ]
        : [];
    const newLists = user.lists
      .map((existingList) => {
        const newList = {
          ...existingList,
          objects: existingList.objects.filter(
            (obj) => obj.id !== object_id || list_ids.includes(existingList.id)
          ),
        };
        return newList;
      })
      .concat(createdLists);
    const newUser = { ...user, newLists };
    await Promise.all(
      createdLists.map((list) => listStore.setItem(list.id, list))
    );
    return newUser;
  },
  update_user: async ({ user, name }) => {
    return { ...user, name };
  },
  update_user_location: async ({ user, lat, lon, elevation, timezone }) => {
    return { ...user, lat, lon, elevation, timezone };
  },
  add_equipment: async ({ user, equipment_details }) => {
    const newEquipment = user.equipment
      .map((equip) => {
        const newEquip = {
          ...equip,
          active: false,
        };
        return newEquip;
      })
      .concat([
        { ...equipment_details, active: true, id: Math.random().toString(36) },
      ]);
    return { ...user, equipment: newEquipment };
  },
  set_active_equipment: async ({ user, id }) => {
    const newEquipment = user.equipment.map((equip) => {
      const newEquip = { ...equip, active: equip.id === id };
      return newEquip;
    });
    return { ...user, equipment: newEquipment };
  },
  delete_equipment: async ({ user, id }) => {
    const newEquipment = user.equipment.filter((equip) => equip.id !== id);
    if (newEquipment.length > 0 && !newEquipment.find((v) => v.active)) {
      newEquipment[0].active = true;
    }
    return { ...user, equipment: newEquipment };
  },
  add_location: async ({ user, location_details }) => {
    const newLocation = user.location
      .map((loc) => {
        const newLoc = {
          ...loc,
          active: false,
          id: Math.random().toString(36),
        };
        return newLoc;
      })
      .concat([
        { ...location_details, active: true, id: Math.random().toString(36) },
      ]);
    return { ...user, location: newLocation };
  },
  set_active_location: async ({ user, id }) => {
    const newLocation = user.location.map((loc) => {
      const newLoc = { ...loc, active: loc.id === id };
      return newLoc;
    });
    return { ...user, location: newLocation };
  },
  delete_location: async ({ user, id }) => {
    const newLocation = user.location.filter((loc) => loc.id !== id);
    if (newLocation.length > 0 && !newLocation.find((v) => v.active)) {
      newLocation[0].active = true;
    }
    return { ...user, location: newLocation };
  },
  add_list: async ({ user, id, listStore }) => {
    const list = await listStore.getItem(id);
    return { ...user, lists: [...user.lists, list] };
  },
  delete_list: async ({ user, id }) => {
    return { ...user, lists: user.lists.filter((list) => list.id !== id) };
  },
};

export { POST_METHODS };

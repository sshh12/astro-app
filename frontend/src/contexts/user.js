import React, { createContext, useContext, useEffect, useState } from "react";
import {
  addLocation,
  createDefaultUser,
  getLocations,
  getUser,
  setOnboarded,
} from "../services/db";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [locations, setLocations] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      let user = await getUser();
      if (!user) {
        user = await createDefaultUser();
      }
      setUser(user);
      setLocations(await getLocations());
    };
    loadUser();
  }, []);

  const _addLocation = async (locationDetails) => {
    await addLocation(locationDetails);
    setUser(await getUser());
    setLocations(await getLocations());
  };

  return (
    <UserContext.Provider
      value={{ user, setOnboarded, addLocation: _addLocation, locations }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  return context;
};

export default UserContext;

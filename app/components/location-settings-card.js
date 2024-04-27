"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  Flex,
  Text,
  List,
  ListItem,
  Dialog,
  DialogPanel,
  Title,
  Button,
  NumberInput,
  TextInput,
  SearchSelect,
  SearchSelectItem,
  Select,
  SelectItem,
  TabGroup,
  Tab,
  TabList,
  TabPanels,
  TabPanel,
} from "@tremor/react";
import BadgeIconRound from "../components/badge-icon-round";
import { useAPI } from "../api";
import { TIMEZONES } from "../timezones";
import { formatLocation } from "../utils";

const LOCATION_MODES = [
  {
    mode: "DEFAULT",
    label: "Geographic Location",
    fields: ["timezone", "lat", "lon", "elevation", "name"],
    desc: "Fill in the fields below to set your observing location.",
  },
];

const FIELDS = {
  lat: ({ key, values, setValues }) => (
    <div key={key}>
      <Text className="mt-2" color="slate-400">
        Latitude
      </Text>
      <NumberInput
        key={key}
        placeholder={"34.118330"}
        enableStepper={false}
        value={values[key]}
        onChange={(e) => setValues({ lat: e.target.value })}
      />
    </div>
  ),
  lon: ({ key, values, setValues }) => (
    <div key={key}>
      <Text className="mt-2" color="slate-400">
        Longitude
      </Text>
      <NumberInput
        key={key}
        placeholder={"-118.300333"}
        enableStepper={false}
        value={values[key]}
        onChange={(e) => setValues({ lon: e.target.value })}
      />
    </div>
  ),
  elevation: ({ key, values, setValues }) => (
    <div key={key}>
      <Text className="mt-2" color="slate-400">
        Elevation (m)
      </Text>
      <NumberInput
        key={key}
        placeholder={"100"}
        enableStepper={false}
        value={values[key]}
        onChange={(e) => setValues({ elevation: e.target.value })}
      />
    </div>
  ),
  timezone: ({ key, values, setValues }) => (
    <div key={key}>
      <Text className="mt-2" color="slate-400">
        Timezone
      </Text>
      <SearchSelect
        enableClear={true}
        placeholder="Timezone"
        value={values[key]}
        onChange={(e) => {
          setValues({ timezone: e });
        }}
      >
        {TIMEZONES.map((tz) => (
          <SearchSelectItem key={tz.name} value={tz.name}>
            {tz.name} (UTC{tz.offset})
          </SearchSelectItem>
        ))}
      </SearchSelect>
    </div>
  ),
  name: ({ key, values, setValues }) => (
    <div key={key}>
      <Text className="mt-2" color="slate-400">
        Nickname
      </Text>
      <TextInput
        key={key}
        placeholder={"My Location"}
        value={values[key]}
        onChange={(e) => setValues({ name: e.target.value })}
      />
    </div>
  ),
};

export default function LocationSettingsCard({
  title,
  icon,
  color,
  open,
  setOpen,
  onAdd,
  onDelete,
  setActive,
}) {
  const { ready, user } = useAPI();

  const [tabIdx, setTabIdx] = useState(0);
  const [editValues, setEditValues] = useState({});
  useEffect(() => {
    setEditValues({
      lat: "",
      lon: "",
      name: "",
      elevation: "",
      timezone: "",
    });
  }, [open]);

  useEffect(() => {
    if (open) {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const tzExists = TIMEZONES.find((t) => t.name === tz);
      if (tzExists) {
        setEditValues((editValues) => ({ ...editValues, timezone: tz }));
      }
    }
  }, [open]);

  const fixedEditValues = { ...editValues };
  if (!fixedEditValues.name) {
    fixedEditValues.name = "My Location";
  }
  fixedEditValues.lat = parseFloat(fixedEditValues.lat);
  fixedEditValues.lon = parseFloat(fixedEditValues.lon);
  fixedEditValues.elevation = parseFloat(fixedEditValues.elevation);
  const curMode = LOCATION_MODES[tabIdx];
  const fieldsReady = curMode.fields.every(
    (f) =>
      fixedEditValues[f] !== undefined &&
      fixedEditValues[f] !== "" &&
      fixedEditValues[f] == fixedEditValues[f]
  );
  const canSave = ready && fieldsReady;

  const existingLocation = user?.location || [];
  existingLocation.sort((a, b) => b.active - a.active);

  const updateCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition((position) => {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const tzExists = TIMEZONES.find((t) => t.name === tz);
      console.log(position);
      setEditValues({
        ...editValues,
        lat: position.coords.latitude,
        lon: position.coords.longitude,
        timezone: tzExists ? tz : editValues.timezone,
        elevation: 0,
        name: "Current Location",
      });
    });
  };

  return (
    <>
      <Dialog open={open} onClose={() => setOpen(false)} static={true}>
        <DialogPanel>
          <Title className="mb-3">{title}</Title>

          {ready && (
            <Flex className="flex-col">
              <List>
                {existingLocation.map((loc) => (
                  <ListItem className="flex-col items-start" key={loc.id}>
                    <Text color="slate-400">
                      {loc.name} / {formatLocation(loc.lat, loc.lon)}
                    </Text>
                    <Flex className="mt-2">
                      {existingLocation.length > 1 && (
                        <Button
                          variant="light"
                          color="red"
                          onClick={() => onDelete(loc)}
                        >
                          Delete
                        </Button>
                      )}
                      {existingLocation.length == 1 && (
                        <Button variant="light" color="red" disabled>
                          Delete
                        </Button>
                      )}
                      {!loc.active && (
                        <Button
                          variant="light"
                          color="blue"
                          onClick={() => setActive(loc)}
                        >
                          Set Primary
                        </Button>
                      )}
                    </Flex>
                  </ListItem>
                ))}
              </List>

              <div
                style={{ height: "2px" }}
                className="w-full bg-gray-800"
              ></div>

              <Flex className="mt-2">
                <TabGroup onIndexChange={(e) => setTabIdx(e)} index={tabIdx}>
                  <TabList variant="line" defaultValue="VISUAL">
                    {LOCATION_MODES.map((m) => (
                      <Tab key={m.mode} value={m.mode}>
                        {m.label}
                      </Tab>
                    ))}
                  </TabList>
                  <TabPanels>
                    {LOCATION_MODES.map((m) => {
                      const modeCfg = LOCATION_MODES.find(
                        (e) => e.mode === m.mode
                      );
                      const inputElements = modeCfg.fields.map((f) => {
                        return FIELDS[f]({
                          key: f,
                          values: editValues,
                          setValues: (vals) =>
                            setEditValues({ ...editValues, ...vals }),
                        });
                      });
                      return (
                        <TabPanel key={m.mode}>
                          <p className="mt-3 mb-3 leading-6">{m.desc}</p>
                          {inputElements}
                        </TabPanel>
                      );
                    })}
                  </TabPanels>
                </TabGroup>
              </Flex>
            </Flex>
          )}

          <Flex className="mt-4 justify-between">
            <Button
              variant="light"
              onClick={() => setOpen(false)}
              color="slate"
            >
              Close
            </Button>
            <Button variant="light" onClick={() => updateCurrentLocation()}>
              Use Device Location
            </Button>
            {canSave && (
              <Button variant="primary" onClick={() => onAdd(fixedEditValues)}>
                Add
              </Button>
            )}
            {!canSave && (
              <Button variant="primary" color="grey" disabled>
                Add
              </Button>
            )}
          </Flex>
        </DialogPanel>
      </Dialog>
      <Card onClick={() => setOpen(true)} className="cursor-pointer">
        <Flex alignItems="start">
          <div className="truncate">
            <Text color="white">{title}</Text>
          </div>
          <BadgeIconRound icon={icon} color={color} />
        </Flex>
        <List className="pt-2">
          {existingLocation.map((loc) => (
            <ListItem key={loc.id}>
              {loc.active && (
                <Text color="slate-400">
                  <b>
                    {loc.name} / {formatLocation(loc.lat, loc.lon)}
                  </b>
                </Text>
              )}
              {!loc.active && (
                <Text color="slate-400">
                  {loc.name} / {formatLocation(loc.lat, loc.lon)}
                </Text>
              )}
            </ListItem>
          ))}
        </List>
      </Card>
    </>
  );
}

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
  SearchSelect,
  SearchSelectItem,
  TextInput,
} from "@tremor/react";
import BadgeIconRound from "../components/badge-icon-round";
import { useAPI } from "../api";
import { TIMEZONES } from "../data/timezones";

export default function SettingsCard({
  title,
  icon,
  color,
  items,
  open,
  setOpen,
  onSave,
}) {
  const { ready } = useAPI();

  const [editValues, setEditValues] = useState({});
  const [showCurLocation, setShowCurLocation] = useState(false);

  const hasLatLonItem = !!items.find((item) => item.key === "lat");
  useEffect(() => {
    if (hasLatLonItem && navigator.geolocation) {
      setShowCurLocation(true);
    }
  }, [hasLatLonItem, open]);

  const updateCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition((position) => {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const tzExists = TIMEZONES.find((t) => t.name === tz);
      setEditValues({
        ...editValues,
        lat: position.coords.latitude,
        lon: position.coords.longitude,
        timezone: tzExists ? tz : editValues.timezone,
      });
    });
  };

  return (
    <>
      <Dialog open={open} onClose={() => setOpen(false)} static={true}>
        <DialogPanel>
          <Title className="mb-3">{title}</Title>

          {ready && (
            <div>
              {items.map((item) => {
                return (
                  <div key={item.name} className="mb-3">
                    <Text className="mb-1">{item.name}</Text>
                    {item.type === "number" && (
                      <NumberInput
                        value={editValues[item.key]}
                        onChange={(e) =>
                          setEditValues({
                            ...editValues,
                            [item.key]: e.target.value,
                          })
                        }
                      />
                    )}
                    {item.type === "text" && (
                      <TextInput
                        value={editValues[item.key]}
                        onChange={(e) =>
                          setEditValues({
                            ...editValues,
                            [item.key]: e.target.value,
                          })
                        }
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <Flex className="mt-4 justify-between">
            {showCurLocation && (
              <Button variant="light" onClick={() => updateCurrentLocation()}>
                Use Device Location
              </Button>
            )}
            {ready && (
              <Button variant="primary" onClick={() => onSave(editValues)}>
                Save
              </Button>
            )}
            {!ready && (
              <Button variant="primary" color="grey">
                Save
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
          {items.map((item) => {
            return (
              <ListItem key={item.name}>
                <Text color="slate-400">{item.name}</Text>
                <Text color="slate-400">{item.value}</Text>
              </ListItem>
            );
          })}
        </List>
      </Card>
    </>
  );
}

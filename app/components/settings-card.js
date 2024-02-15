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

export default function SettingsCard({
  title,
  icon,
  color,
  items,
  open,
  setOpen,
  onSave,
}) {
  const { ready, user } = useAPI();

  const [editValues, setEditValues] = useState({});
  useEffect(() => {
    if (open) {
      setEditValues(
        items.reduce((acc, item) => {
          acc[item.key] = item.value;
          return acc;
        }, {})
      );
    } else {
      setEditValues({});
    }
  }, [items, open]);

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
                    {item.type === "select" && (
                      <SearchSelect
                        value={editValues[item.key]}
                        onChange={(v) =>
                          setEditValues({
                            ...editValues,
                            [item.key]: v,
                          })
                        }
                      >
                        {user.timezones.map((tz) => (
                          <SearchSelectItem key={tz.name} value={tz.name}>
                            {tz.name} (UTC{tz.offset})
                          </SearchSelectItem>
                        ))}
                      </SearchSelect>
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

          <div className="mt-3">
            <Button variant="light" onClick={() => onSave(editValues)}>
              Save
            </Button>
          </div>
        </DialogPanel>
      </Dialog>
      <Card onClick={() => setOpen(true)}>
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
                <span>{item.name}</span>
                <span>{item.value}</span>
              </ListItem>
            );
          })}
        </List>
      </Card>
    </>
  );
}

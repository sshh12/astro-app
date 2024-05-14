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
  const { ready } = useAPI();

  const [editValues, setEditValues] = useState({});
  useEffect(() => {
    if (open) {
      setEditValues({
        ...items.reduce((acc, item) => {
          acc[item.key] = item.value;
          return acc;
        }, {}),
      });
    }
  }, [open, items]);

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

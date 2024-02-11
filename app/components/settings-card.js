"use client";

import React from "react";
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
} from "@tremor/react";
import BadgeIconRound from "../components/badge-icon-round";

export default function SettingsCard({ title, icon, color, items }) {
  return (
    <>
      <Dialog open={false} onClose={() => void 0} static={true}>
        <DialogPanel>
          <Title className="mb-3">Title</Title>
          <div className="mt-3">
            <Button variant="light" onClick={() => save()}>
              Save
            </Button>
          </div>
        </DialogPanel>
      </Dialog>
      <Card>
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

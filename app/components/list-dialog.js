"use client";

import React from "react";
import {
  Dialog,
  DialogPanel,
  Title,
  Button,
  List,
  ListItem,
  Switch,
  TextInput,
} from "@tremor/react";
import { useNav } from "../nav";

export default function ListDialog({ object }) {
  return (
    <Dialog open={false} onClose={(val) => void 0} static={true}>
      <DialogPanel>
        <Title className="mb-3">{object.name}</Title>
        <List>
          <ListItem key={"a"}>
            <span>List 1</span>
            <span>
              <Switch />
            </span>
          </ListItem>
          <ListItem key={"a"}>
            <span>
              <TextInput placeholder="New List" />
            </span>
            <span>
              <Switch />
            </span>
          </ListItem>
        </List>
        <div className="mt-3">
          <Button variant="light" onClick={() => setIsOpen(false)}>
            Save
          </Button>
        </div>
      </DialogPanel>
    </Dialog>
  );
}

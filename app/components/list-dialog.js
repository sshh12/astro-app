"use client";

import React, { useState, useEffect } from "react";
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
import { useAPI } from "../api";

export default function ListDialog({ object, open, setOpen }) {
  const { user, ready, postThenUpdateUser } = useAPI();
  const [objectLists, setObjectLists] = useState([]);
  const [newList, setNewList] = useState("");
  const existingLists = user?.lists;

  useEffect(() => {
    if (user) {
      setObjectLists(
        existingLists.filter((list) =>
          list.objects.find((obj) => obj.id === object.id)
        )
      );
    }
  }, [user, existingLists, object.id]);

  const save = () => {
    const newListIds = objectLists.map((list) => list.id);
    postThenUpdateUser("update_space_object_lists", {
      list_ids: newListIds,
      new_list_title: newList,
      object_id: object.id,
    }).then(() => {
      setNewList("");
      setOpen(false);
    });
  };

  return (
    <Dialog open={open} onClose={() => setOpen(false)} static={true}>
      <DialogPanel>
        <Title className="mb-3">Lists for {object.name}</Title>
        <List>
          {existingLists.map((list) => (
            <ListItem key={list.id}>
              <span>{list.title}</span>
              <span>
                <Switch
                  checked={
                    !!objectLists.find((objList) => objList.id === list.id)
                  }
                  onChange={(checked) => {
                    if (checked) {
                      setObjectLists([...objectLists, list]);
                    } else {
                      setObjectLists(
                        objectLists.filter((objList) => objList.id !== list.id)
                      );
                    }
                  }}
                />
              </span>
            </ListItem>
          ))}
          <ListItem>
            <span>
              <TextInput
                placeholder="New List"
                onChange={(e) => setNewList(e.target.value)}
                value={newList}
              />
            </span>
            <span>
              <Switch checked={newList.length > 0} />
            </span>
          </ListItem>
        </List>
        <div className="mt-3">
          {ready && (
            <Button variant="light" onClick={() => save()}>
              Save
            </Button>
          )}
          {!ready && (
            <Button variant="light" color="grey">
              Saving...
            </Button>
          )}
        </div>
      </DialogPanel>
    </Dialog>
  );
}

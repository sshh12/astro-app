import Button from "@mui/joy/Button";
import Checkbox from "@mui/joy/Checkbox";
import Input from "@mui/joy/Input";
import List from "@mui/joy/List";
import ListItem from "@mui/joy/ListItem";
import ListItemContent from "@mui/joy/ListItemContent";
import Modal from "@mui/joy/Modal";
import ModalClose from "@mui/joy/ModalClose";
import ModalDialog from "@mui/joy/ModalDialog";
import Stack from "@mui/joy/Stack";
import Typography from "@mui/joy/Typography";
import React, { useEffect, useState } from "react";

export default function SkyObjectListsModal({ open, setOpen, object, lists }) {
  const [loading, setLoading] = useState(false);
  const [selectedLists, setSelectedLists] = useState(null);
  const [newListTitle, setNewListTitle] = useState("");
  const listsJSON = JSON.stringify(lists);
  const { updateUser } = useBackend();

  useEffect(() => {
    const lists = JSON.parse(listsJSON);
    if (!lists) return;
    const relatedLists = lists.filter((lst) =>
      lst.objects.map((o) => o.id).includes(object?.id)
    );
    setSelectedLists(relatedLists.map((lst) => lst.id));
  }, [listsJSON, object]);

  const handleSubmit = () => {
    setLoading(true);
    updateUser("update_space_object_lists", {
      list_ids: selectedLists,
      new_list_title: newListTitle,
      object_id: object.id,
    }).then(() => {
      setLoading(false);
      setOpen(false);
      setNewListTitle("");
    });
  };

  return (
    <Modal open={open} onClose={() => setOpen(false)}>
      <ModalDialog>
        <ModalClose />
        <Typography>Lists</Typography>
        <List>
          {lists?.map((list) => (
            <ListItem key={list.id}>
              <ListItemContent>
                <Typography level="body-sm" fontWeight="lg">
                  {list.title}
                </Typography>
              </ListItemContent>
              <Checkbox
                checked={selectedLists?.includes(list.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedLists((slists) => [...slists, list.id]);
                  } else {
                    setSelectedLists((slists) =>
                      slists.filter((id) => id !== list.id)
                    );
                  }
                }}
              />
            </ListItem>
          ))}
          <ListItem>
            <ListItemContent>
              <Typography level="body-sm" fontWeight="lg">
                <Input
                  placeholder="New List"
                  size="sm"
                  value={newListTitle}
                  onChange={(e) => setNewListTitle(e.target.value)}
                />
              </Typography>
            </ListItemContent>
            <Checkbox checked={!!newListTitle} />
          </ListItem>
        </List>
        <Stack direction="row" sx={{ justifyContent: "end" }}>
          <Button onClick={handleSubmit} loading={loading}>
            Update
          </Button>
        </Stack>
      </ModalDialog>
    </Modal>
  );
}

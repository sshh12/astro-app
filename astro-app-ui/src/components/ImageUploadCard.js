import React, { useEffect, useState } from "react";
import Typography from "@mui/joy/Typography";
import {
  Card,
  Box,
  Button,
  Modal,
  ModalDialog,
  ModalClose,
  Stack,
} from "@mui/joy";
import { usePost, useBackend } from "../providers/backend";

const VALID_FILE_TYPES = ["image/jpeg", "image/png"];

function UploadConfirmModal({ open, setOpen, file }) {
  const { post } = usePost();
  const { updateUser } = useBackend();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!file) {
      setOpen(false);
    }
  }, [file, setOpen]);

  const onUpload = async () => {
    setLoading(true);
    const { signedUrl, url } = await post("get_signed_image_upload", {
      type: file.type,
    });
    await fetch(signedUrl, {
      method: "PUT",
      body: file,
    });
    await updateUser(
      "add_image",
      {
        url,
      },
      () => {
        setLoading(false);
        setOpen(false);
      }
    );
  };

  return (
    <Modal open={open} onClose={() => !loading && setOpen(false)}>
      <ModalDialog>
        <ModalClose />
        <Typography>Upload {file?.name}</Typography>
        <Typography level="body-sm">
          The contents of this image will be uploaded to a public accessible
          (but unlisted) link. It may also be shared with an astrometric
          provider like astrometry.net for analysis. You maintain all rights to
          this image.
        </Typography>
        <Stack direction="row" justifyContent="space-between">
          <Button
            variant="outlined"
            disabled={loading}
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button onClick={() => onUpload()} loading={loading}>
            Upload
          </Button>
        </Stack>
      </ModalDialog>
    </Modal>
  );
}

function UploadFailedModal({ open, setOpen }) {
  return (
    <Modal open={open} onClose={() => setOpen(false)}>
      <ModalDialog>
        <ModalClose />
        <Typography>Upload Failed</Typography>
        <Typography level="body-sm">
          This file type is not supported. Please upload a JPEG or PNG image.
        </Typography>
      </ModalDialog>
    </Modal>
  );
}

export default function ImageUploadCard() {
  const [isDragging, setIsDragging] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [failedOpen, setFailedOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const onUpload = (file) => {
    console.log("Selected:", file);
    if (!VALID_FILE_TYPES.includes(file.type)) {
      setFailedOpen(true);
      return;
    } else {
      setSelectedFile(file);
      setConfirmOpen(true);
    }
  };

  return (
    <Card sx={{ p: 0 }}>
      <UploadConfirmModal
        open={confirmOpen}
        setOpen={setConfirmOpen}
        file={selectedFile}
      />
      <UploadFailedModal open={failedOpen} setOpen={setFailedOpen} />
      <Box sx={{ mb: 1, pt: 2, px: 2 }}>
        <Typography level="title-md">Upload Image</Typography>
        <Typography level="body-sm">
          Add an image to be processed and analyzed.
        </Typography>
      </Box>
      <Box
        sx={{
          border: "5px solid",
          borderColor: isDragging
            ? "primary.outlinedBorder"
            : "neutral.outlinedBorder",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "10rem",
        }}
        onDrop={(ev) => {
          ev.preventDefault();
          if (ev.dataTransfer.items) {
            [...ev.dataTransfer.items].forEach((item, i) => {
              // If dropped items aren't files, reject them
              if (item.kind === "file") {
                const file = item.getAsFile();
                onUpload(file);
              }
            });
          } else {
            [...ev.dataTransfer.files].forEach((file, i) => {
              onUpload(file);
            });
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
      >
        <label htmlFor="file-upload">
          <input
            id="file-upload"
            type="file"
            style={{ display: "none" }}
            onChange={(e) => onUpload(e.target.files[0])}
          />
          <Button color="primary" component="span">
            Upload Image
          </Button>
        </label>
      </Box>
    </Card>
  );
}

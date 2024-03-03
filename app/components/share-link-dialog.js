"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogPanel,
  Title,
  Button,
  Flex,
  TextInput,
} from "@tremor/react";
import { BASE_URL } from "../api";

export default function ShareLinkDialog({ open, setOpen, title, path }) {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(`${BASE_URL}${path}`);
  };
  return (
    <Dialog open={open} onClose={() => setOpen(false)} static={true}>
      <DialogPanel>
        <Title className="mb-3">{title}</Title>
        <TextInput value={`${BASE_URL}${path}`} />
        <Flex className="mt-3">
          <Button variant="light" onClick={() => setOpen(false)} color="slate">
            Close
          </Button>
          <Button variant="primary" onClick={() => copyToClipboard()}>
            Copy
          </Button>
        </Flex>
      </DialogPanel>
    </Dialog>
  );
}

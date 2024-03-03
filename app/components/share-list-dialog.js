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

export default function ShareListDialog({ open, setOpen, list }) {
  return (
    <Dialog open={open} onClose={() => setOpen(false)} static={true}>
      <DialogPanel>
        <Title className="mb-3">Share {list?.title}</Title>
        <TextInput value={`${BASE_URL}/sky/list?id=${list?.id}`} />
        <Flex className="mt-3">
          <Button variant="light" onClick={() => setOpen(false)} color="slate">
            Close
          </Button>
        </Flex>
      </DialogPanel>
    </Dialog>
  );
}

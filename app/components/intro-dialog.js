"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogPanel, Title, Button, Flex } from "@tremor/react";
import { useNav } from "../nav";
import { useAnalytics } from "../api";

const SEEN_KEY = "astro-app:introDialogSeen";

export default function IntroDialog() {
  const [open, setOpen] = useState(false);
  const { setPage } = useNav();
  const emitEvent = useAnalytics();

  useEffect(() => {
    const seen = localStorage.getItem(SEEN_KEY);
    if (!seen) {
      setOpen(true);
    }
  }, []);

  const close = () => {
    setOpen(false);
    emitEvent("intro_close");
    localStorage.setItem(SEEN_KEY, "true");
  };

  return (
    <Dialog open={open} onClose={() => close()} static={true}>
      <DialogPanel>
        <Title className="mb-3">Astro App</Title>
        Welcome! The Astro App (beta) requires your location and preferred
        timezone for accurate astronomical calculations.
        <Flex className="mt-3">
          <Button variant="light" onClick={() => close()} color="slate">
            Demo Location
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              close();
              setPage("/profile", { openLocationSettings: true });
              emitEvent("intro_update_location");
            }}
          >
            Update Location
          </Button>
        </Flex>
      </DialogPanel>
    </Dialog>
  );
}

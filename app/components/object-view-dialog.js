"use client";

import React from "react";
import {
  Dialog,
  DialogPanel,
  Title,
  Button,
  SearchSelect,
  SearchSelectItem,
} from "@tremor/react";

export default function ObjectViewDialog({
  badgeModes,
  imageModes,
  objectViewMode,
  setObjectViewMode,
  open,
  setOpen,
}) {
  const close = () => {
    setOpen(false);
  };
  return (
    <Dialog open={open} onClose={() => close()} static={true}>
      <DialogPanel>
        <Title className="mb-3">View Options</Title>

        <label className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
          Badge
        </label>
        <SearchSelect
          className="mb-3"
          value={objectViewMode.badgeMode}
          onChange={(v) =>
            setObjectViewMode({ ...objectViewMode, badgeMode: v })
          }
        >
          {badgeModes.map((mode) => (
            <SearchSelectItem key={mode.id} value={mode.id}>
              {mode.label}
            </SearchSelectItem>
          ))}
        </SearchSelect>

        <label className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
          Image
        </label>
        <SearchSelect
          className="mb-3"
          value={objectViewMode.imageMode}
          onChange={(v) =>
            setObjectViewMode({ ...objectViewMode, imageMode: v })
          }
        >
          {imageModes.map((mode) => (
            <SearchSelectItem key={mode.id} value={mode.id}>
              {mode.label}
            </SearchSelectItem>
          ))}
        </SearchSelect>

        <div className="mt-20">
          <Button variant="light" onClick={() => close()}>
            Save
          </Button>
        </div>
      </DialogPanel>
    </Dialog>
  );
}

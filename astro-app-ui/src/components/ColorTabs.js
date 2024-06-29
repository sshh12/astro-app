import React from "react";
import { Box, Stack, Tooltip } from "@mui/joy";
import { grey } from "@mui/material/colors";

export function ColorTabs({ tabs, outlineIdx }) {
  const renderTabs = tabs.map((t, i) => {
    let borderRadius = null;
    if (i === 0) {
      borderRadius = "0.3rem 0 0 0.3rem";
    } else if (i === tabs.length - 1) {
      borderRadius = "0 0.3rem 0.3rem 0";
    }
    let outline = null;
    if (i === outlineIdx) {
      outline = `2px solid ${grey[500]}`;
    }
    return (
      <Tooltip
        title={t.tooltip}
        arrow
        enterTouchDelay={1}
        enterDelay={1}
        key={i}
      >
        <Box
          sx={{
            bgcolor: t.color,
            height: "100%",
            flexGrow: 1,
            borderRadius: borderRadius,
            outline: outline,
          }}
        ></Box>
      </Tooltip>
    );
  });
  return (
    <Stack
      sx={{ height: "2.5rem", borderRadius: "sm" }}
      direction="row"
      spacing={"2px"}
    >
      {renderTabs}
    </Stack>
  );
}

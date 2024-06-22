import React from "react";
import { Box, Stack, Tooltip } from "@mui/joy";

export function ColorTabs({ tabs }) {
  const renderTabs = tabs.map((t, i) => {
    let borderRadius = null;
    if (i === 0) {
      borderRadius = "0.3rem 0 0 0.3rem";
    } else if (i === tabs.length - 1) {
      borderRadius = "0 0.3rem 0.3rem 0";
    }
    return (
      <Tooltip title={t.tooltip}>
        <Box
          sx={{
            bgcolor: t.color,
            height: "100%",
            flexGrow: 1,
            borderRadius: borderRadius,
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

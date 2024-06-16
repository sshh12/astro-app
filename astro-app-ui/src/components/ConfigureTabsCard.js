import React from "react";
import {
  Card,
  Box,
  Typography,
  CardActions,
  Button,
  CardOverflow,
} from "@mui/joy";
import Tabs from "@mui/joy/Tabs";
import TabList from "@mui/joy/TabList";
import Tab, { tabClasses } from "@mui/joy/Tab";
import TabPanel from "@mui/joy/TabPanel";

export function ConfigureTabPanel({ idx, children, p = 2 }) {
  return (
    <TabPanel sx={{ p: p }} value={idx}>
      {children}
    </TabPanel>
  );
}

export default function ConfigureTabsCard({
  title,
  subtitle,
  tabs,
  children,
  buttonName = null,
  buttonLoading = false,
  onButtonClick = null,
}) {
  return (
    <Card sx={{ p: 0 }}>
      <Box sx={{ mb: 1, pt: 2, px: 2 }}>
        <Typography level="title-md">{title}</Typography>
        <Typography level="body-sm">{subtitle}</Typography>
      </Box>
      <Tabs
        variant="outlined"
        defaultValue={0}
        sx={{
          borderRadius: "0",
          boxShadow: "0",
          overflow: "auto",
        }}
      >
        <TabList
          disableUnderline
          tabFlex={1}
          sx={{
            [`& .${tabClasses.root}`]: {
              fontSize: "sm",
              fontWeight: "lg",
              [`&[aria-selected="true"]`]: {
                color: "primary.500",
                bgcolor: "background.surface",
              },
              [`&.${tabClasses.focusVisible}`]: {
                outlineOffset: "-4px",
              },
            },
          }}
        >
          {tabs.map((tab) => (
            <Tab
              disableIndicator
              key={tab.idx}
              variant="soft"
              sx={{ flexGrow: 1 }}
            >
              {tab.title}
            </Tab>
          ))}
        </TabList>
        {children}
      </Tabs>
      {buttonName && (
        <CardOverflow sx={{ paddingRight: 2, paddingBottom: 2 }}>
          <CardActions sx={{ alignSelf: "flex-end" }}>
            {buttonName && (
              <Button
                size="sm"
                variant="solid"
                loading={buttonLoading}
                onClick={() =>
                  !buttonLoading && onButtonClick && onButtonClick()
                }
              >
                {buttonName}
              </Button>
            )}
          </CardActions>
        </CardOverflow>
      )}
    </Card>
  );
}

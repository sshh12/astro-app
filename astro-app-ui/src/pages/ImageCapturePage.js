import React, { useState } from "react";
import Card from "@mui/joy/Card";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Typography from "@mui/joy/Typography";
import ImageUploadCard from "../components/ImageUploadCard";
import BaseImagePage from "../components/BaseImagePage";
import Chip from "@mui/joy/Chip";
import Stack from "@mui/joy/Stack";
import Tabs from "@mui/joy/Tabs";
import AspectRatio from "@mui/joy/AspectRatio";
import TabList from "@mui/joy/TabList";
import Tab from "@mui/joy/Tab";
import TabPanel from "@mui/joy/TabPanel";
import Divider from "@mui/joy/Divider";
import Slider from "@mui/joy/Slider";
import { useBackend } from "../providers/backend";

function ImageCard({ image }) {
  const [zoom, setZoom] = useState(0);
  const hasAnalysis = image.astrometryStatus === "DONE";
  const defaultIdx = hasAnalysis ? 1 : 0;
  return (
    <Card sx={{ p: 0 }}>
      <Box sx={{ mb: 1, pt: 2, px: 2 }}>
        <Stack direction={"row"} justifyContent={"space-between"}>
          <Typography level="title-md">{image.title}</Typography>
          {image.astrometryStatus === "DONE" && (
            <Chip variant="soft" color="success">
              Analyzed
            </Chip>
          )}
          {image.astrometryStatus === "PENDING" && (
            <Chip variant="soft" color="warning">
              Analyzing...
            </Chip>
          )}
          {image.astrometryStatus === "ERROR" && (
            <Chip variant="soft" color="danger">
              Analysis Failed
            </Chip>
          )}
        </Stack>
      </Box>
      <Divider />
      <Tabs defaultValue={defaultIdx} size="sm">
        <TabList sx={{ justifyContent: "center", flexGrow: 1 }}>
          <Tab>Original</Tab>
          <Tab disabled={!hasAnalysis}>Annotated</Tab>
          <Tab disabled={!hasAnalysis}>Position</Tab>
        </TabList>
        <TabPanel value={0}>
          <Box>
            <img
              src={image.mainImageUrl}
              alt={image.id}
              style={{ objectFit: "contain", width: "100%", height: "100%" }}
            />
          </Box>
        </TabPanel>
        <TabPanel value={1}>
          <Box>
            <img
              src={`https://nova.astrometry.net/annotated_display/${image.astrometryJobId}`}
              alt={image.id}
              style={{ objectFit: "contain", width: "100%", height: "100%" }}
            />
          </Box>
        </TabPanel>
        <TabPanel value={2}>
          <Box sx={{ px: 4, pb: 2 }}>
            <Slider
              aria-label="Zoom"
              value={zoom}
              getAriaValueText={(v) => v}
              valueLabelDisplay="auto"
              onChange={(_, v) => setZoom(v)}
              marks={[
                {
                  value: 0,
                  label: "Full Sky",
                },
                {
                  value: 1,
                  label: "",
                },
                {
                  value: 2,
                  label: "Zoomed",
                },
              ]}
              min={0}
              max={2}
            />
          </Box>
          <Box>
            <AspectRatio ratio={1}>
              <img
                src={`https://nova.astrometry.net/sky_plot/zoom${zoom}/${image.astrometryJobCalibrationsId}/`}
                alt={image.id}
                style={{ objectFit: "contain", width: "100%", height: "100%" }}
              />
            </AspectRatio>
          </Box>
        </TabPanel>
      </Tabs>
    </Card>
  );
}

export default function ImageCapturePage() {
  const { user, updateUser } = useBackend();
  const [refreshLoading, setRefreshLoading] = useState(false);
  const images = user?.images || [];
  return (
    <BaseImagePage tabIdx={0} maxWidth={"100vw"}>
      <Stack sx={{ maxWidth: "400px" }} gap={2}>
        <ImageUploadCard />
        <Button
          onClick={() => {
            setRefreshLoading(true);
            updateUser("refresh_images", {}, () => setRefreshLoading(false));
          }}
          loading={refreshLoading}
          color="primary"
        >
          Refresh Analysis
        </Button>
      </Stack>
      <Divider />
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: { xs: 0.5, sm: 2 },
        }}
      >
        {images.map((image) => (
          <ImageCard key={image.id} image={image} />
        ))}
        <Box sx={{ height: { xs: "4rem", sm: 0 } }}></Box>
      </Box>
    </BaseImagePage>
  );
}

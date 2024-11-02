import { Delete } from "@mui/icons-material";
import { AspectRatio } from "@mui/joy";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Card from "@mui/joy/Card";
import Chip from "@mui/joy/Chip";
import Divider from "@mui/joy/Divider";
import IconButton from "@mui/joy/IconButton";
import Stack from "@mui/joy/Stack";
import Tooltip from "@mui/joy/Tooltip";
import Typography from "@mui/joy/Typography";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import BaseImagePage from "../components/BaseImagePage";
import ImageUploadCard from "../components/ImageUploadCard";
import { RichListListItem } from "../components/SkyListLists";
import { useBackend, useObjects } from "../providers/backend";

function commonAspectRatio(images) {
  if (!images) {
    return 1;
  }
  const ratios = images.map((i) => i.widthPx / i.heightPx);
  ratios.sort(
    (a, b) =>
      ratios.filter((v) => v === a).length -
      ratios.filter((v) => v === b).length
  );
  return ratios[0];
}

function ImageCard({ image, aspectRatio }) {
  const { updateUser } = useBackend();
  const { objects } = useObjects(image?.mappedObjs?.map((o) => o[0]) || []);
  const link = `/image/images/${image.id}`;
  return (
    <Card sx={{ p: 0 }}>
      <Box sx={{ mb: 1, pt: 2, px: 2 }}>
        <Stack direction={"row"} justifyContent={"space-between"}>
          <Typography level="title-md" sx={{ minHeight: "3rem" }}>
            {image.title}
          </Typography>
          {image.astrometryStatus === "DONE" && (
            <Chip variant="soft" color="success" sx={{ maxHeight: "1rem" }}>
              Analyzed
            </Chip>
          )}
          {image.astrometryStatus === "PENDING" && (
            <Chip variant="soft" color="warning" sx={{ maxHeight: "1rem" }}>
              Analyzing
            </Chip>
          )}
          {image.astrometryStatus === "ERROR" && (
            <Chip variant="soft" color="danger" sx={{ maxHeight: "1rem" }}>
              Failed
            </Chip>
          )}
        </Stack>
      </Box>
      <Divider />
      <Box>
        <Link to={link}>
          <AspectRatio ratio={aspectRatio}>
            <img
              src={image.mainImageUrl}
              alt={image.id}
              style={{
                objectFit: "contain",
                width: "100%",
                height: "100%",
              }}
            />
          </AspectRatio>
        </Link>
      </Box>
      <Divider />
      <Box sx={{ paddingX: "10px" }}>
        <RichListListItem
          title="Image Objects"
          objects={objects || []}
          link={link}
        />
      </Box>
      <Divider />
      <Stack
        justifyItems={"end"}
        alignItems={"end"}
        flexGrow={0}
        sx={{ paddingX: "8px", marginBottom: "8px" }}
      >
        <Tooltip title="Delete this image">
          <IconButton
            size="sm"
            color="danger"
            onClick={() => {
              if (
                window.confirm("Are you sure you want to delete this image?")
              ) {
                updateUser("delete_image", { id: image.id });
              }
            }}
          >
            <Delete />
          </IconButton>
        </Tooltip>
      </Stack>
    </Card>
  );
}

export default function ImageAnalyzePage() {
  const { user, updateUser } = useBackend();
  const [refreshLoading, setRefreshLoading] = useState(false);
  const images = user?.images || [];
  const aspectRatio = commonAspectRatio(images);
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
          Refresh Image Analysis
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
          <ImageCard key={image.id} image={image} aspectRatio={aspectRatio} />
        ))}
      </Box>
      <Box sx={{ height: { xs: "4rem", sm: 0 } }}></Box>
    </BaseImagePage>
  );
}

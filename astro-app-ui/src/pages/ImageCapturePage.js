import React, { useEffect } from "react";
import Card from "@mui/joy/Card";
import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";
import ImageUploadCard from "../components/ImageUploadCard";
import BaseImagePage from "../components/BaseImagePage";
import { useBackend } from "../providers/backend";

function ImageCard({ image }) {
  return (
    <Card sx={{ p: 0 }}>
      <Box sx={{ mb: 1, pt: 2, px: 2 }}>
        <Typography level="title-md">{image.title}</Typography>
        <Typography level="body-sm">Image</Typography>
      </Box>
      <img src={image.mainImageUrl} alt={image.id} />
    </Card>
  );
}

export default function ImageCapturePage() {
  const { user, updateUser } = useBackend();

  useEffect(() => {
    if (updateUser) {
      updateUser("refresh_images", {});
    }
  }, [updateUser]);

  const images = user?.images || [];
  return (
    <BaseImagePage tabIdx={0}>
      <ImageUploadCard />
      {images.map((image) => (
        <ImageCard key={image.id} image={image} />
      ))}
    </BaseImagePage>
  );
}

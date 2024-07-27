import Card from "@mui/joy/Card";
import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";

export default function AcknowledgementsCard() {
  return (
    <Card sx={{ p: 0 }}>
      <Box sx={{ mb: 2, pt: 2, px: 2 }}>
        <Typography level="title-md">Acknowledgements ❤️</Typography>
        <Typography level="body-sm">
          Thanks to HiPS2FITS for sky survey data, wikipedia for object
          descriptions, astronomy.tools for equipment data, OpenStreetMap for
          map visuals, and David Lorenz for light pollution tools.
        </Typography>
      </Box>
    </Card>
  );
}

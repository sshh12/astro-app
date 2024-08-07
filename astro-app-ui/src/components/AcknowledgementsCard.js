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
          descriptions, astronomy.tools for equipment data, astrometry.net for
          platesolving, OpenStreetMap for map visuals, Stuart Lowe for
          VirtualSky, and David Lorenz for light pollution tools.
        </Typography>
      </Box>
    </Card>
  );
}

import React from "react";
import Box from "@mui/joy/Box";
import Card from "@mui/joy/Card";
import Typography from "@mui/joy/Typography";
import IconButton from "@mui/joy/IconButton";
import Dropdown from "@mui/joy/Dropdown";
import Menu from "@mui/joy/Menu";
import MenuButton from "@mui/joy/MenuButton";
import MenuItem from "@mui/joy/MenuItem";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import SortIcon from "@mui/icons-material/Sort";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import ViewComfyIcon from "@mui/icons-material/ViewComfy";
import AspectRatio from "@mui/joy/AspectRatio";
import CardOverflow from "@mui/joy/CardOverflow";

export default function SkyObjectCard({ object }) {
  return (
    <Card variant="outlined" size="sm">
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Box sx={{ flex: 1 }}>
          <Typography level="title-md">{object.name}</Typography>
          <Typography level="body-sm">Max 53°</Typography>
        </Box>
        <Dropdown>
          <MenuButton
            variant="plain"
            size="sm"
            sx={{
              maxWidth: "32px",
              maxHeight: "32px",
              borderRadius: "9999999px",
            }}
          >
            <IconButton
              component="span"
              variant="plain"
              color="neutral"
              size="sm"
            >
              <MoreVertRoundedIcon />
            </IconButton>
          </MenuButton>
          <Menu
            placement="bottom-end"
            size="sm"
            sx={{
              zIndex: "99999",
              p: 1,
              gap: 1,
              "--ListItem-radius": "var(--joy-radius-sm)",
            }}
          >
            <MenuItem>
              <SortIcon />
              Change sorting
            </MenuItem>
            <MenuItem>
              <ViewComfyIcon />
              Change display
            </MenuItem>
            <MenuItem sx={{ textColor: "danger.500" }}>
              <DeleteRoundedIcon color="danger" />
              Remove from list
            </MenuItem>
          </Menu>
        </Dropdown>
      </Box>
      <CardOverflow
        sx={{
          borderBottom: "1px solid",
          borderTop: "1px solid",
          borderColor: "neutral.outlinedBorder",
        }}
      >
        <AspectRatio ratio="16/9" color="primary" sx={{ borderRadius: 0 }}>
          <img
            alt=""
            src="https://alasky.cds.unistra.fr/hips-image-services/hips2fits?hips=CDS/P/DSS2/color&width=1778&height=1000&fov=1.2760916013153696&projection=TAN&coordsys=icrs&rotation_angle=0.0&ra=10.684708333333331&dec=41.26875&format=jpg"
          />
        </AspectRatio>
      </CardOverflow>
    </Card>
  );
}

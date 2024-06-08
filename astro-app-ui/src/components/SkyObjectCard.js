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
import Skeleton from "@mui/joy/Skeleton";
import ObjectImage from "./SkyObjectImage";
import { useBackend } from "../providers/backend";
import { equipmentToDetails } from "../utils/equipment";

function SkyObjectCardSkeleton({ eqDetails }) {
  return (
    <Card variant="outlined" size="sm">
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Box sx={{ flex: 1 }}>
          <Typography level="title-md">
            <Skeleton>A sky object</Skeleton>
          </Typography>
        </Box>
      </Box>
      <CardOverflow
        sx={{
          borderBottom: "1px solid",
          borderTop: "1px solid",
          borderColor: "neutral.outlinedBorder",
        }}
      >
        <AspectRatio
          ratio={eqDetails.aspectRatio}
          color="primary"
          sx={{ borderRadius: 0 }}
        >
          <Skeleton variant="overlay">
            <img
              alt=""
              src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
            />
          </Skeleton>
        </AspectRatio>
      </CardOverflow>
    </Card>
  );
}

export default function SkyObjectCard({ object }) {
  const { equipment } = useBackend();
  const eqDetails = equipmentToDetails(equipment);
  if (!object) {
    return <SkyObjectCardSkeleton eqDetails={eqDetails} />;
  }
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
        <AspectRatio
          ratio={eqDetails.aspectRatio}
          color="primary"
          sx={{ borderRadius: 0 }}
        >
          <ObjectImage object={object} />
        </AspectRatio>
      </CardOverflow>
    </Card>
  );
}

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
import AspectRatio from "@mui/joy/AspectRatio";
import CardOverflow from "@mui/joy/CardOverflow";
import Skeleton from "@mui/joy/Skeleton";
import CardContent from "@mui/joy/CardContent";
import ObjectImage from "./SkyObjectImage";
import Chip from "@mui/joy/Chip";
import Stack from "@mui/joy/Stack";
import { useBackend } from "../providers/backend";
import { equipmentToDetails } from "../utils/equipment";
import { OBJECT_FIELDS } from "../utils/object";
import { Link } from "react-router-dom";

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

export default function SkyObjectCard({ object, orbits, setDisplayModalOpen }) {
  const { equipment, objDisplay } = useBackend();
  const eqDetails = equipmentToDetails(equipment);
  if (!object || !objDisplay) {
    return <SkyObjectCardSkeleton eqDetails={eqDetails} />;
  }
  const badges = objDisplay.badges.map((badgeId) =>
    OBJECT_FIELDS.find((s) => s.id === badgeId).badge({
      obj: object,
      orbits: orbits,
    })
  );
  return (
    <Card variant="outlined" size="sm">
      <Stack
        direction={badges && badges.length > 1 ? "column" : "row"}
        spacing={1}
        sx={{ display: "flex" }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography level="title-md">{object.name}</Typography>
        </Box>
        {badges && (
          <Stack direction="row" gap={1} flexWrap="wrap">
            {badges.map(
              (badge) =>
                badge && (
                  <Chip
                    size="md"
                    key={badge.text}
                    variant="soft"
                    color={badge.color}
                    endDecorator={badge.icon && <badge.icon />}
                  >
                    {badge.text}
                  </Chip>
                )
            )}
          </Stack>
        )}
      </Stack>
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
          <Link
            to={{ pathname: `/sky/object/${object.id}` }}
            style={{ textDecoration: "none" }}
          >
            <ObjectImage object={object} />
          </Link>
        </AspectRatio>
      </CardOverflow>
      <CardContent
        orientation="horizontal"
        sx={{
          display: "flex",
          justifyItems: "end",
          justifyContent: "end",
        }}
      >
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
            <MenuItem onClick={() => setDisplayModalOpen(true)}>
              <SortIcon />
              Change sorting & display
            </MenuItem>
            {/* <MenuItem sx={{ textColor: "danger.500" }}>
              <DeleteRoundedIcon color="danger" />
              Remove from list
            </MenuItem> */}
          </Menu>
        </Dropdown>
      </CardContent>
    </Card>
  );
}

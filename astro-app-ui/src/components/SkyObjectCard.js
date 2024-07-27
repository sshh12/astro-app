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

function SkyObjectCardOptions({ setDisplayModalOpen }) {
  return (
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
        <IconButton component="span" variant="plain" color="neutral" size="sm">
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
      </Menu>
    </Dropdown>
  );
}

function BadgesGroup({ badges }) {
  if (!badges) return <></>;
  return (
    <Stack direction="row" gap={1} flexWrap="wrap" alignItems={"center"}>
      {badges.map(
        (badge) =>
          badge && (
            <Chip
              size="md"
              key={badge.text}
              variant="soft"
              color={badge.color}
              endDecorator={badge.icon && <badge.icon />}
              sx={{ maxHeight: "1rem" }}
            >
              {badge.text}
            </Chip>
          )
      )}
    </Stack>
  );
}

export default function SkyObjectCard({ object, orbits, setDisplayModalOpen }) {
  const { equipment, displaySettings } = useBackend();
  const eqDetails = equipmentToDetails(equipment);
  if (!object || !displaySettings) {
    return <SkyObjectCardSkeleton eqDetails={eqDetails} />;
  }
  const badges = displaySettings.badges.map((badgeId) =>
    OBJECT_FIELDS.find((s) => s.id === badgeId).badge({
      obj: object,
      orbits: orbits,
    })
  );
  const singleBadge = !badges || badges.length === 1;
  return (
    <Card variant="outlined" size="sm">
      <Stack>
        <Stack direction={"row"} spacing={1} sx={{ display: "flex" }}>
          <Box sx={{ flex: 1, alignContent: "center", minHeight: "3rem" }}>
            <Typography level="title-md">{object.name}</Typography>
          </Box>
          {singleBadge && <BadgesGroup badges={badges} />}
          <SkyObjectCardOptions setDisplayModalOpen={setDisplayModalOpen} />
        </Stack>
        {!singleBadge && <BadgesGroup badges={badges} />}
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
    </Card>
  );
}

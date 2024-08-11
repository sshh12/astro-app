import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import ListIcon from "@mui/icons-material/List";
import { Divider } from "@mui/joy";
import Accordion from "@mui/joy/Accordion";
import AccordionDetails from "@mui/joy/AccordionDetails";
import AccordionGroup from "@mui/joy/AccordionGroup";
import AccordionSummary from "@mui/joy/AccordionSummary";
import Avatar from "@mui/joy/Avatar";
import AvatarGroup from "@mui/joy/AvatarGroup";
import Box from "@mui/joy/Box";
import List from "@mui/joy/List";
import ListItem from "@mui/joy/ListItem";
import ListItemButton from "@mui/joy/ListItemButton";
import ListItemContent from "@mui/joy/ListItemContent";
import ListItemDecorator from "@mui/joy/ListItemDecorator";
import ListSubheader from "@mui/joy/ListSubheader";
import Sheet from "@mui/joy/Sheet";
import Skeleton from "@mui/joy/Skeleton";
import Typography from "@mui/joy/Typography";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { idxToColorHex } from "../constants/colors";
import { CURATED_LISTS } from "../constants/lists";
import { getImageURL } from "./SkyObjectImage";
import Toggler from "./Toggler";

const REC_PROMPT =
  "Show me the best objects to observe tonight based on my location and equipment.";

function RichListSideBarItem({ list, idx }) {
  return list.fake ? (
    <ListItem key={list.id}>
      <ListItemButton>
        <ListItemContent>
          <Skeleton variant="text"></Skeleton>
        </ListItemContent>
      </ListItemButton>
    </ListItem>
  ) : (
    <Link
      to={{ pathname: `/sky/list/${list.id}` }}
      style={{ textDecoration: "none" }}
      key={list.id}
    >
      <ListItem>
        <ListItemButton>
          <ListItemDecorator>
            <Box
              sx={{
                width: "10px",
                height: "10px",
                borderRadius: "99px",
                bgcolor: idxToColorHex(idx),
              }}
            />
          </ListItemDecorator>
          <ListItemContent>{list.title}</ListItemContent>
        </ListItemButton>
      </ListItem>
    </Link>
  );
}

function useBgColor() {
  const [hue, setHue] = useState(getCurrentHue());

  function getCurrentHue() {
    const date = new Date();
    const seconds = date.getSeconds() + date.getMilliseconds() / 1000;
    return (seconds * 16) % 360;
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setHue(getCurrentHue());
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return `hsl(${hue}, 100%, 50%)`;
}

function MagicRichListSideBarItem() {
  const bgColor = useBgColor();
  return (
    <Link
      to={{ pathname: "/sky/search", search: `?d=${REC_PROMPT}` }}
      style={{ textDecoration: "none" }}
    >
      <ListItem>
        <ListItemButton>
          <ListItemDecorator>
            <Box
              sx={{
                width: "10px",
                height: "10px",
                borderRadius: "99px",
                bgcolor: bgColor,
              }}
            />
          </ListItemDecorator>
          <ListItemContent>Recommendations</ListItemContent>
        </ListItemButton>
      </ListItem>
    </Link>
  );
}

export function ListSideBar({ lists }) {
  const lsts =
    (lists && lists.filter((lst) => lst.title !== "Favorites")) ||
    Array.from({ length: 5 }).map((_, i) => ({ id: i, fake: true }));
  return (
    <List size="sm" sx={{ "--ListItem-radius": "8px", "--List-gap": "4px" }}>
      <ListItem nested>
        <ListSubheader sx={{ letterSpacing: "2px", fontWeight: "800" }}>
          Sky
        </ListSubheader>
        <List
          size="sm"
          sx={{
            "--ListItemDecorator-size": "20px",
            "& .JoyListItemButton-root": { p: "8px" },
          }}
        >
          <MagicRichListSideBarItem />
          {lsts.map((lst, idx) => (
            <RichListSideBarItem list={lst} key={lst.id} idx={idx} />
          ))}
        </List>
      </ListItem>
      <ListItem nested>
        <Toggler
          renderToggle={({ open, setOpen }) => (
            <ListItemButton onClick={() => setOpen(!open)}>
              <ListIcon />
              <ListItemContent>
                <Typography level="body-sm">Curated Lists</Typography>
              </ListItemContent>
              <KeyboardArrowDownIcon
                sx={{ transform: open ? "rotate(180deg)" : "none" }}
              />
            </ListItemButton>
          )}
        >
          <List
            size="sm"
            sx={{
              "--ListItemDecorator-size": "20px",
              "& .JoyListItemButton-root": { p: "8px" },
            }}
          >
            {CURATED_LISTS.map((lst, idx) => (
              <RichListSideBarItem
                list={lst}
                key={lst.id}
                idx={lsts.length + idx}
              />
            ))}
          </List>
        </Toggler>
      </ListItem>
    </List>
  );
}

function ObjectAvatar({ object }) {
  return (
    <Avatar
      key={object.id}
      src={getImageURL(object)}
      slots={{
        img: () => (
          <img
            src={getImageURL(object)}
            alt={object.name}
            crossOrigin="anonymous"
            style={{
              objectFit: "contain",
              color: "transparent",
              textIndent: "10000px",
              width: "100%",
              height: "100%",
              textAlign: "center",
            }}
            className="MuiAvatar-img"
          />
        ),
      }}
    />
  );
}

export function RichListListItem({
  list = null,
  objects = null,
  title = null,
  link = null,
  idx = 0,
}) {
  if (list?.fake) {
    return (
      <ListItem key={list?.id}>
        <ListItemButton>
          <ListItemContent>
            <Skeleton variant="text"></Skeleton>
          </ListItemContent>
        </ListItemButton>
      </ListItem>
    );
  }
  const renderTitle = list?.title || title;
  const renderLink = !!list ? `/sky/list/${list?.id}` : link;
  const objs = list?.objects || objects;
  const avatarsObjs = objs.slice(0, 3);
  const extras = objs.length - avatarsObjs.length;
  return (
    <Link
      to={{ pathname: renderLink }}
      style={{ textDecoration: "none" }}
      key={list?.id || title}
    >
      <ListItem>
        <ListItemButton>
          {list && (
            <ListItemDecorator>
              <Box
                sx={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "99px",
                  bgcolor: idxToColorHex(idx),
                }}
              />
            </ListItemDecorator>
          )}
          <ListItemContent>
            <Typography fontSize={"0.9rem"}>{renderTitle}</Typography>
          </ListItemContent>
          <AvatarGroup>
            {avatarsObjs.map((obj) => (
              <ObjectAvatar object={obj} key={obj.id} />
            ))}
            {!!extras && <Avatar>+{Math.min(extras, 99)}</Avatar>}
            {objects && objects.length === 0 && <Avatar>0</Avatar>}
          </AvatarGroup>
          <KeyboardArrowRight />
        </ListItemButton>
      </ListItem>
    </Link>
  );
}

export function MagicRichListListItem() {
  const bgColor = useBgColor();
  return (
    <Link
      to={{ pathname: "/sky/search", search: `?d=${REC_PROMPT}` }}
      style={{ textDecoration: "none" }}
    >
      <ListItem>
        <ListItemButton sx={{ minHeight: "40px" }}>
          <ListItemDecorator>
            <Box
              sx={{
                width: "10px",
                height: "10px",
                borderRadius: "99px",
                bgcolor: bgColor,
              }}
            />
          </ListItemDecorator>
          <ListItemContent>
            <Typography fontSize={"0.9rem"}>Recommendations</Typography>
          </ListItemContent>
          <KeyboardArrowRight />
        </ListItemButton>
      </ListItem>
    </Link>
  );
}

export function ListMobileTab({ lists }) {
  const lsts =
    (lists && lists.filter((lst) => lst.title !== "Favorites")) ||
    Array.from({ length: 5 }).map((_, i) => ({ id: i, fake: true }));
  return (
    <Sheet
      variant="outlined"
      sx={{
        display: { xs: "inherit", sm: "none" },
        borderRadius: "sm",
        overflow: "hidden",
        backgroundColor: "background.surface",
        gridColumn: "1/-1",
      }}
    >
      <Typography
        id="decorated-list-demo"
        level="body-xs"
        textTransform="uppercase"
        fontWeight="lg"
        mb={1}
        sx={{
          pt: 2,
          pl: 2,
        }}
      >
        Lists
      </Typography>
      <List
        size="sm"
        sx={{
          "--ListItemDecorator-size": "20px",
          "& .JoyListItemButton-root": { p: "8px" },
          pl: 1,
        }}
      >
        <MagicRichListListItem />
        {lsts.map((lst, idx) => (
          <RichListListItem list={lst} key={lst.id} idx={idx} />
        ))}
      </List>
      <Divider />
      <AccordionGroup>
        <Accordion>
          <AccordionSummary>
            <Typography level="body-sm">Curated Lists</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List
              size="sm"
              sx={{
                "--ListItemDecorator-size": "20px",
                "& .JoyListItemButton-root": { p: "8px" },
                pl: 1,
              }}
            >
              {CURATED_LISTS.map((lst, idx) => (
                <RichListListItem
                  list={lst}
                  key={lst.id}
                  idx={lsts.length + idx}
                />
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      </AccordionGroup>
    </Sheet>
  );
}

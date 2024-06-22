import * as React from "react";
import List from "@mui/joy/List";
import ListItem from "@mui/joy/ListItem";
import ListSubheader from "@mui/joy/ListSubheader";
import ListItemButton from "@mui/joy/ListItemButton";
import Box from "@mui/joy/Box";
import ListItemDecorator from "@mui/joy/ListItemDecorator";
import ListItemContent from "@mui/joy/ListItemContent";
import Skeleton from "@mui/joy/Skeleton";
import { getImageURL } from "./SkyObjectImage";
import Sheet from "@mui/joy/Sheet";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import Typography from "@mui/joy/Typography";
import AvatarGroup from "@mui/joy/AvatarGroup";
import Avatar from "@mui/joy/Avatar";
import AccordionGroup from "@mui/joy/AccordionGroup";
import Accordion from "@mui/joy/Accordion";
import AccordionSummary from "@mui/joy/AccordionSummary";
import AccordionDetails from "@mui/joy/AccordionDetails";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ListIcon from "@mui/icons-material/List";
import { Link } from "react-router-dom";
import { idxToColorHex } from "../constants/colors";
import { CURATED_LISTS, PUBLIC_LISTS } from "../constants/lists";
import Toggler from "./Toggler";

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
      <ListItem nested>
        <Toggler
          renderToggle={({ open, setOpen }) => (
            <ListItemButton
              onClick={() => setOpen(!open)}
              sx={{ marginTop: 0 }}
            >
              <ListIcon />
              <ListItemContent>
                <Typography level="body-sm">Public Lists</Typography>
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
            {PUBLIC_LISTS.map((lst, idx) => (
              <RichListSideBarItem
                list={lst}
                key={lst.id}
                idx={lsts.length + CURATED_LISTS.length + idx}
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
            crossorigin="anonymous"
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

function RichListListItem({ list, idx }) {
  if (list.fake) {
    return (
      <ListItem key={list.id}>
        <ListItemButton>
          <ListItemContent>
            <Skeleton variant="text"></Skeleton>
          </ListItemContent>
        </ListItemButton>
      </ListItem>
    );
  }
  const avatarsObjs = list.objects.slice(0, 3);
  const extras = list.objects.length - avatarsObjs.length;
  return (
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
          <ListItemContent>
            <Typography fontSize={"0.9rem"}>{list.title}</Typography>
          </ListItemContent>
          <AvatarGroup>
            {avatarsObjs.map((obj) => (
              <ObjectAvatar object={obj} key={obj.id} />
            ))}
            {!!extras && <Avatar>+{Math.min(extras, 99)}</Avatar>}
          </AvatarGroup>
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
        paddingBottom: 2,
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
        {lsts.map((lst, idx) => (
          <RichListListItem list={lst} key={lst.id} idx={idx} />
        ))}
      </List>
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
        <Accordion>
          <AccordionSummary>
            <Typography level="body-sm">Public Lists</Typography>
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
              {PUBLIC_LISTS.map((lst, idx) => (
                <RichListListItem
                  list={lst}
                  key={lst.id}
                  idx={lsts.length + CURATED_LISTS.length + idx}
                />
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      </AccordionGroup>
    </Sheet>
  );
}

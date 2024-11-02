import List from "@mui/joy/List";
import ListItem from "@mui/joy/ListItem";
import ListSubheader from "@mui/joy/ListSubheader";
import ListItemButton from "@mui/joy/ListItemButton";
import ListItemContent from "@mui/joy/ListItemContent";
import { ListItemDecorator } from "@mui/joy";
import { Link } from "react-router-dom";

export function SideBarNav({ title, items }) {
  return (
    <List size="sm" sx={{ "--ListItem-radius": "8px", "--List-gap": "4px" }}>
      <ListItem nested>
        <ListSubheader sx={{ letterSpacing: "2px", fontWeight: "800" }}>
          {title}
        </ListSubheader>
        <List
          size="sm"
          sx={{
            "--ListItemDecorator-size": "20px",
            "& .JoyListItemButton-root": { p: "8px" },
          }}
        >
          {items.map((item) => (
            <Link
              key={item.pathname}
              to={{ pathname: item.pathname }}
              style={{ textDecoration: "none" }}
            >
              <ListItem>
                <ListItemButton
                  sx={{ bgcolor: item.selected && "background.body" }}
                >
                  <ListItemDecorator>
                    <item.icon />
                  </ListItemDecorator>
                  <ListItemContent sx={{ ml: 1 }}>{item.text}</ListItemContent>
                </ListItemButton>
              </ListItem>
            </Link>
          ))}
        </List>
      </ListItem>
    </List>
  );
}

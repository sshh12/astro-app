import React, { Fragment, useMemo } from "react";
import Card from "@mui/joy/Card";
import Typography from "@mui/joy/Typography";
import List from "@mui/joy/List";
import ListItem from "@mui/joy/ListItem";
import ListItemButton from "@mui/joy/ListItemButton";
import ListItemDecorator from "@mui/joy/ListItemDecorator";
import Box from "@mui/joy/Box";
import ListItemContent from "@mui/joy/ListItemContent";
import { renderTime } from "../utils/date";
import { colorToHex } from "../constants/colors";
import {
  CartesianGrid,
  Line,
  LineChart as ReChartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function HoverCard({ ts, objects, tz }) {
  let objs = objects.filter((obj) => obj.alt > 0);
  objs.sort((a, b) => b.alt - a.alt);
  objs = objs.slice(0, 5);
  return (
    <Card>
      <div>
        <Typography level="title-md">{renderTime(ts, tz)}</Typography>
        <List
          aria-labelledby="nav-list-tags"
          size="sm"
          sx={{
            "--ListItemDecorator-size": "20px",
            "& .JoyListItemButton-root": { p: "8px" },
          }}
        >
          {objs.map((obj) => (
            <ListItem key={obj.id}>
              <ListItemButton>
                <ListItemDecorator>
                  <Box
                    sx={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "99px",
                      bgcolor: colorToHex(obj.color),
                    }}
                  />
                </ListItemDecorator>
                <ListItemContent>{obj.name}</ListItemContent>
                <Typography textColor="text.tertiary">
                  {Math.round(obj.alt)}°
                </Typography>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </div>
    </Card>
  );
}

export default function SkyAltitudesChart({ objects, orbits, stale }) {
  const data = useMemo(() => {
    const rows = [];
    for (let i in orbits.time) {
      const row = {
        time: orbits.time[i],
      };
      for (let obj of objects) {
        const alt = orbits.objects[obj.id].alt[i];
        row[obj.id] = alt > 0 ? alt : null;
      }
      rows.push(row);
    }
    return rows;
  }, [objects, orbits]);
  return (
    <ResponsiveContainer style={{}}>
      <ReChartsLineChart data={data}>
        <CartesianGrid
          strokeDasharray="1 5"
          horizontal={true}
          vertical={false}
          verticalPoints={[30, 60]}
        />
        <XAxis
          hide={true}
          dataKey={"time"}
          interval={"equidistantPreserveStart"}
          tick={{ transform: "translate(0, 6)" }}
          fill=""
          stroke=""
          className={""}
          tickLine={false}
          axisLine={false}
          minTickGap={5}
        />
        <YAxis
          width={0}
          hide={true}
          axisLine={true}
          tickLine={true}
          type="number"
          domain={[0, 90]}
          tick={{ transform: "translate(-3, 0)" }}
          ticks={[0, 30, 60, 90]}
          fill="#fff000"
          stroke="#fff"
          className={""}
          tickFormatter={(number) => `${number}°`}
          allowDecimals={true}
        />
        <Tooltip
          wrapperStyle={{ outline: "none" }}
          isAnimationActive={false}
          cursor={{ stroke: "#d1d5db", strokeWidth: 1 }}
          content={({ payload, label }) => {
            const objs = payload.map((p) => ({
              ...objects.find((o) => o.id === p.dataKey),
              alt: p.value,
            }));
            return <HoverCard ts={label} objects={objs} tz={orbits.timezone} />;
          }}
          position={{ y: 0 }}
        />
        {objects.map((obj) => (
          <Line
            className=""
            dot={({ index }) => {
              return <Fragment key={index}></Fragment>;
            }}
            activeDot={{
              strokeWidth: 0,
              r: 4,
              strokeDasharray: "",
            }}
            key={obj.id}
            name={obj.id}
            type={"monotone"}
            dataKey={obj.id}
            stroke={stale ? "gray" : colorToHex(obj.color)}
          />
        ))}
      </ReChartsLineChart>
    </ResponsiveContainer>
  );
}

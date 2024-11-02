import Box from "@mui/joy/Box";
import Card from "@mui/joy/Card";
import List from "@mui/joy/List";
import ListItem from "@mui/joy/ListItem";
import ListItemButton from "@mui/joy/ListItemButton";
import ListItemContent from "@mui/joy/ListItemContent";
import ListItemDecorator from "@mui/joy/ListItemDecorator";
import Typography from "@mui/joy/Typography";
import React, { useMemo } from "react";
import {
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { colorToHex } from "../constants/colors";
import { renderTime } from "../utils/date";
import { renderAz } from "../utils/pos";

function HoverCard({ az, objects, tz }) {
  let objs = objects.filter((obj) => obj.alt > 0);
  objs.sort((a, b) => b.alt - a.alt);
  objs = objs.slice(0, 5);
  return (
    <Card>
      <div>
        <Typography level="title-md">{renderAz(az)}</Typography>
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
                  {Math.round(obj.alt)}° ({renderTime(obj.ts, tz)})
                </Typography>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </div>
    </Card>
  );
}

function interpolate(ary, n) {
  const result = [];
  for (let i = 0; i < ary.length - 1; i++) {
    const start = ary[i];
    const end = ary[i + 1];
    for (let j = 0; j < n; j++) {
      const mid = start + (end - start) * (j / n);
      const diffFromStart = Math.abs(mid - start);
      if (diffFromStart > 20) {
        result.push(start);
      } else {
        result.push(mid);
      }
    }
  }
  return result;
}

function buildRadialData(objects, orbits) {
  const gap = 1;
  const interp = 1;
  const angleToRow = {};
  for (let i = 0; i < 360; i += gap) {
    angleToRow[i] = { az: i };
  }
  for (let obj of objects) {
    const times = interpolate([...orbits.time], interp);
    const alts = interpolate(orbits.objects[obj.id].alt, interp);
    const azs = interpolate(orbits.objects[obj.id].az, interp);
    for (let i in times) {
      const azRound = (Math.round(azs[i] / gap) * gap) % 360;
      const row = angleToRow[azRound];
      row[obj.id] = alts[i] > 0 ? 90 - alts[i] : null;
      row[obj.id + "_ts"] = times[i];
    }
  }
  return Object.values(angleToRow);
}

export default function SkyPositionsChart({ objects, orbits, stale }) {
  const data = useMemo(() => {
    return buildRadialData(objects, orbits);
  }, [objects, orbits]);
  return (
    <ResponsiveContainer style={{}}>
      <RadarChart data={data} outerRadius={"100%"}>
        <PolarGrid
          polarRadius={[30, 60, 90]}
          polarAngles={[0, 90, 180, 270]}
          gridType="circle"
        />
        <PolarRadiusAxis domain={[0, 90]} tick={false} />
        <Tooltip
          wrapperStyle={{ outline: "none" }}
          isAnimationActive={false}
          cursor={{ stroke: "#d1d5db", strokeWidth: 1 }}
          content={({ payload }) => {
            const objs = payload.map((p) => ({
              ...objects.find((o) => o.id === p.dataKey),
              alt: 90 - p.payload[p.dataKey],
              az: p.payload["az"],
              ts: p.payload[p.dataKey + "_ts"],
            }));
            return (
              <HoverCard
                az={objs[0]?.az || 0}
                objects={objs}
                tz={orbits.timezone}
              />
            );
          }}
          position={{ y: 0 }}
        />
        {objects.map((obj) => (
          <Radar
            points={[]}
            name={obj.name}
            dataKey={obj.id}
            fill="none"
            stroke="none"
            dot={{ fill: stale ? "gray" : colorToHex(obj.color), r: 1 }}
          />
        ))}
      </RadarChart>
    </ResponsiveContainer>
  );
}

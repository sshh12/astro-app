import React, { useMemo } from "react";
import Card from "@mui/joy/Card";
import Typography from "@mui/joy/Typography";
import List from "@mui/joy/List";
import ListItem from "@mui/joy/ListItem";
import ListItemButton from "@mui/joy/ListItemButton";
import ListItemDecorator from "@mui/joy/ListItemDecorator";
import Box from "@mui/joy/Box";
import ListItemContent from "@mui/joy/ListItemContent";
import { renderTime } from "../utils/date";
import {
  ResponsiveContainer,
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  Line,
} from "recharts";

function HoverCard({ az, objects, tz }) {
  let objs = objects.filter((obj) => obj.alt > 0);
  objs.sort((a, b) => b.alt - a.alt);
  objs = objs.slice(0, 5);
  return (
    <Card>
      <div>
        <Typography level="title-md">{az}°</Typography>
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
                      bgcolor: obj.color,
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

function buildRadialData(objects, orbits) {
  const angleToRow = {};
  for (let i = 0; i < 360; i += 5) {
    angleToRow[i] = { az: i };
  }
  for (let obj of objects) {
    const times = [...orbits.time];
    const alts = orbits.objects[obj.id].alt;
    const azs = orbits.objects[obj.id].az;
    for (let i in times) {
      const azRound = (Math.round(azs[i] / 5) * 5) % 360;
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
          content={({ payload, label }) => {
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
            stroke={stale ? "gray" : obj.color}
            fill="none"
            shape={<Line connectNulls={false} />}
          />
        ))}
      </RadarChart>
    </ResponsiveContainer>
  );
}

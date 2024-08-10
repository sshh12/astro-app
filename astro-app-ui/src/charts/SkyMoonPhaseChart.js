import React, { Fragment, useMemo } from "react";
import Card from "@mui/joy/Card";
import Typography from "@mui/joy/Typography";
import List from "@mui/joy/List";
import ListItem from "@mui/joy/ListItem";
import ListItemButton from "@mui/joy/ListItemButton";
import ListItemDecorator from "@mui/joy/ListItemDecorator";
import Box from "@mui/joy/Box";
import ListItemContent from "@mui/joy/ListItemContent";
import { renderDate } from "../utils/date";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function HoverCard({ ts, tz, dayInfo }) {
  return (
    <Card>
      <div>
        <Typography level="title-md">{renderDate(ts, tz)}</Typography>
        <List
          aria-labelledby="nav-list-tags"
          size="sm"
          sx={{
            "--ListItemDecorator-size": "20px",
            "& .JoyListItemButton-root": { p: "8px" },
          }}
        >
          <ListItem>
            <ListItemButton>
              <ListItemDecorator>
                <Box
                  sx={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "99px",
                    bgcolor: "#eee",
                  }}
                />
              </ListItemDecorator>
              <ListItemContent>Illumination</ListItemContent>
              <Typography textColor="text.tertiary">
                {dayInfo.sun_illumination_pct} %
              </Typography>
            </ListItemButton>
          </ListItem>
        </List>
      </div>
    </Card>
  );
}

export default function SkyMoonPhaseChart({
  object,
  timezone,
  longOrbit,
  stale,
}) {
  const data = useMemo(() => {
    const rows = [];
    for (let dayDetails of longOrbit) {
      const row = {
        time: dayDetails.start,
        pctIll: dayDetails.sun_illumination_pct,
      };
      rows.push(row);
    }
    return rows;
  }, [longOrbit]);

  return (
    <ResponsiveContainer style={{}}>
      <LineChart data={data}>
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
          domain={[0, 100]}
          tick={{ transform: "translate(-3, 0)" }}
          ticks={[0, 25, 50, 75, 100]}
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
            if (payload && payload[0] && payload[0].payload) {
              const dayInfo = longOrbit.find(
                (d) => d.start === payload[0].payload.time
              );
              return <HoverCard ts={label} dayInfo={dayInfo} tz={timezone} />;
            }
            return <Fragment></Fragment>;
          }}
          position={{ y: 0 }}
        />
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
          name={"pctIll"}
          type={"monotone"}
          dataKey={"pctIll"}
          stroke={stale ? "gray" : "#eee"}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

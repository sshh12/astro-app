import React, { Fragment } from "react";
import Card from "@mui/joy/Card";
import Typography from "@mui/joy/Typography";
import List from "@mui/joy/List";
import ListItem from "@mui/joy/ListItem";
import ListItemButton from "@mui/joy/ListItemButton";
import ListItemDecorator from "@mui/joy/ListItemDecorator";
import Box from "@mui/joy/Box";
import ListItemContent from "@mui/joy/ListItemContent";
import {
  CartesianGrid,
  Line,
  LineChart as ReChartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function HoverCard({ ts, objects }) {
  const objs = objects;
  return (
    <Card>
      <div>
        <Typography level="title-md">{ts}</Typography>
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
                      bgcolor: "primary.500",
                    }}
                  />
                </ListItemDecorator>
                <ListItemContent>
                  {obj.name} {obj.alt}
                </ListItemContent>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </div>
    </Card>
  );
}

export default function SkyAltitudesChart() {
  const objects = [
    { id: 1, name: "object", color: "#ff00ff" },
    { id: 2, name: "object2", color: "#ffff00" },
  ];
  const data = [];
  const startDate = +new Date();
  for (let i = 0; i < 300; i++) {
    const row = {
      time: startDate + i * 60000,
    };
    row["1"] = Math.sin(i / 10) * 30 + 45;
    row["2"] = Math.sin((i - 100) / 10) * 30 + 45;
    data.push(row);
  }
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
          padding={{ left: 20, right: 20 }}
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
          width={40}
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
            return <HoverCard ts={label} objects={objs} />;
          }}
          position={{ y: 0 }}
        />
        {objects.map((obj) => (
          <Line
            className=""
            dot={({ index }) => {
              return <Fragment key={index}>test</Fragment>;
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
            stroke={obj.color}
            isAnimationActive={false}
          />
        ))}
      </ReChartsLineChart>
    </ResponsiveContainer>
  );
}

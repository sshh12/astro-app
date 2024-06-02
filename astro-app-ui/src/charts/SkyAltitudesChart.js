import React, { Fragment } from "react";
import {
  CartesianGrid,
  Line,
  LineChart as ReChartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

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
            let note = label + " " + JSON.stringify(payload);
            const dateLabel = new Date(label).toLocaleDateString("en-US", {});
            const itemLabel = `${dateLabel} (${note})`;
            return <div>{itemLabel}</div>;
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

"use client";
import React, { Fragment, useState } from "react";
import {
  CartesianGrid,
  Dot,
  Line,
  LineChart as ReChartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceArea,
  ReferenceLine,
} from "recharts";

import ChartTooltip from "@tremor/react/dist/components/chart-elements/common/ChartTooltip";
import NoData from "@tremor/react/dist/components/chart-elements/common/NoData";
import {
  constructCategoryColors,
  hasOnlyOneValueForThisKey,
} from "@tremor/react/dist/components/chart-elements/common/utils";

import { BaseColors } from "@tremor/react/dist/lib/constants";
import { tremorTwMerge } from "@tremor/react/dist/lib/tremorTwMerge";
import { getColorClassNames } from "@tremor/react/dist/lib/utils";
import { colorPalette } from "@tremor/react/dist/lib/theme";

import { minMaxIdx, useTimestamp } from "../utils";

const altValueFormatter = (number) => `${number}°`;

const TEN_MINS = 1000 * 60 * 10;

const SkyChart = React.forwardRef((props, ref) => {
  const {
    times,
    timeStates,
    timezone,
    objects = [],
    index = "time",
    valueFormatter = altValueFormatter,
    startEndOnly = false,
    showXAxis = true,
    showYAxis = true,
    yAxisWidth = 40,
    intervalType = "equidistantPreserveStart",
    animationDuration = 900,
    showAnimation = false,
    showTooltip = true,
    showGridLines = true,
    autoMinValue = false,
    curveType = "monotone",
    minValue,
    maxValue,
    connectNulls = false,
    allowDecimals = true,
    noDataText,
    className,
    onValueChange,
    enableLegendSlider = false,
    customTooltip,
    rotateLabelX,
    tickGap = 5,
    ...other
  } = props;

  const categories = objects.map((object) => object.name);
  const colors = objects.map((object) => object.color.toLowerCase());
  const CustomTooltip = customTooltip;
  const paddingValue = !showXAxis && !showYAxis ? 0 : 20;
  const [activeDot, setActiveDot] = useState(undefined);
  const [activeLegend, setActiveLegend] = useState(undefined);
  const categoryColors = constructCategoryColors(categories, colors);

  const yAxisDomain = [0, 90];
  const hasOnValueChange = !!onValueChange;
  const { ts } = useTimestamp();

  const data = [];
  for (let i = 0; i < times.length; i++) {
    const row = {
      time: times[i],
    };
    for (let object of objects) {
      row[object.name] = object.alt[i] > 0 ? object.alt[i] : null;
    }
    data.push(row);
  }

  function onDotClick(itemData, event) {
    event.stopPropagation();

    if (!hasOnValueChange) return;
    if (
      (itemData.index === activeDot?.index &&
        itemData.dataKey === activeDot?.dataKey) ||
      (hasOnlyOneValueForThisKey(data, itemData.dataKey) &&
        activeLegend &&
        activeLegend === itemData.dataKey)
    ) {
      setActiveLegend(undefined);
      setActiveDot(undefined);
      onValueChange?.(null);
    } else {
      setActiveLegend(itemData.dataKey);
      setActiveDot({
        index: itemData.index,
        dataKey: itemData.dataKey,
      });
      onValueChange?.({
        eventType: "dot",
        categoryClicked: itemData.dataKey,
        ...itemData.payload,
      });
    }
  }

  function onCategoryClick(dataKey) {
    if (!hasOnValueChange) return;
    if (
      (dataKey === activeLegend && !activeDot) ||
      (hasOnlyOneValueForThisKey(data, dataKey) &&
        activeDot &&
        activeDot.dataKey === dataKey)
    ) {
      setActiveLegend(undefined);
      onValueChange?.(null);
    } else {
      setActiveLegend(dataKey);
      onValueChange?.({
        eventType: "category",
        categoryClicked: dataKey,
      });
    }
    setActiveDot(undefined);
  }

  const nowX = Math.min(
    Math.max(Math.floor(ts / TEN_MINS) * TEN_MINS, times[0]),
    times[times.length - 1]
  );

  return (
    <div
      ref={ref}
      className={tremorTwMerge("w-full h-80", className)}
      {...other}
    >
      <ResponsiveContainer className="h-full w-full">
        {data?.length ? (
          <ReChartsLineChart
            data={data}
            onClick={
              hasOnValueChange && (activeLegend || activeDot)
                ? () => {
                    setActiveDot(undefined);
                    setActiveLegend(undefined);
                    onValueChange?.(null);
                  }
                : undefined
            }
          >
            <CartesianGrid
              strokeDasharray="1 5"
              horizontal={true}
              vertical={false}
              verticalPoints={[30, 60]}
            />
            <ReferenceLine x={nowX} stroke="#434c5e" label="" strokeWidth={3} />
            <ReferenceArea
              x1={times[minMaxIdx(timeStates, 0)[1]]}
              x2={times[minMaxIdx(timeStates, 3)[0]]}
              strokeOpacity={0}
              fill="rgba(0, 0, 0, 0.5)"
            />
            <ReferenceArea
              x1={times[minMaxIdx(timeStates, 3)[0]]}
              x2={times[minMaxIdx(timeStates, 4)[1]]}
              strokeOpacity={0}
              fill="rgba(0, 0, 0, 0.7)"
            />
            <ReferenceArea
              x1={times[minMaxIdx(timeStates, 4)[1]]}
              x2={times[minMaxIdx(timeStates, 7)[0]]}
              strokeOpacity={0}
              fill="rgba(0, 0, 0, 0.5)"
            />
            <XAxis
              padding={{ left: paddingValue, right: paddingValue }}
              hide={true}
              dataKey={index}
              interval={startEndOnly ? "preserveStartEnd" : intervalType}
              tick={{ transform: "translate(0, 6)" }}
              ticks={
                startEndOnly
                  ? [data[0][index], data[data.length - 1][index]]
                  : undefined
              }
              fill=""
              stroke=""
              className={tremorTwMerge(
                // common
                "text-tremor-label",
                // light
                "fill-tremor-content",
                // dark
                "dark:fill-dark-tremor-content"
              )}
              tickLine={false}
              axisLine={false}
              minTickGap={tickGap}
              angle={rotateLabelX?.angle}
              dy={rotateLabelX?.verticalShift}
              height={rotateLabelX?.xAxisHeight}
            />
            <YAxis
              width={yAxisWidth}
              hide={true}
              axisLine={true}
              tickLine={true}
              type="number"
              domain={yAxisDomain}
              tick={{ transform: "translate(-3, 0)" }}
              ticks={[0, 30, 60, 90]}
              fill="#fff000"
              stroke="#fff"
              className={tremorTwMerge(
                // common
                "text-tremor-label",
                // light
                "fill-tremor-content",
                // dark
                "dark:fill-dark-tremor-content"
              )}
              tickFormatter={valueFormatter}
              allowDecimals={allowDecimals}
            />
            <Tooltip
              wrapperStyle={{ outline: "none" }}
              isAnimationActive={false}
              cursor={{ stroke: "#d1d5db", strokeWidth: 1 }}
              content={
                showTooltip ? (
                  ({ active, payload, label }) =>
                    CustomTooltip ? (
                      <CustomTooltip
                        payload={payload?.map((payloadItem) => ({
                          ...payloadItem,
                          color:
                            categoryColors.get(payloadItem.dataKey) ??
                            BaseColors.Gray,
                        }))}
                        active={active}
                        label={label}
                      />
                    ) : (
                      <ChartTooltip
                        active={active}
                        payload={payload}
                        label={new Date(label).toLocaleTimeString("en-US", {
                          timeZone: timezone,
                        })}
                        valueFormatter={valueFormatter}
                        categoryColors={categoryColors}
                      />
                    )
                ) : (
                  <></>
                )
              }
              position={{ y: 0 }}
            />
            {categories.map((category) => (
              <Line
                className={tremorTwMerge(
                  getColorClassNames(
                    categoryColors.get(category) ?? BaseColors.Gray,
                    colorPalette.text
                  ).strokeColor
                )}
                strokeOpacity={
                  activeDot || (activeLegend && activeLegend !== category)
                    ? 0.3
                    : 1
                }
                activeDot={(props) => {
                  const {
                    cx,
                    cy,
                    stroke,
                    strokeLinecap,
                    strokeLinejoin,
                    strokeWidth,
                    dataKey,
                  } = props;
                  return (
                    <Dot
                      className={tremorTwMerge(
                        "stroke-tremor-background dark:stroke-dark-tremor-background",
                        onValueChange ? "cursor-pointer" : "",
                        getColorClassNames(
                          categoryColors.get(dataKey) ?? BaseColors.Gray,
                          colorPalette.text
                        ).fillColor
                      )}
                      cx={cx}
                      cy={cy}
                      r={5}
                      fill=""
                      stroke={stroke}
                      strokeLinecap={strokeLinecap}
                      strokeLinejoin={strokeLinejoin}
                      strokeWidth={strokeWidth}
                      onClick={(dotProps, event) => onDotClick(props, event)}
                    />
                  );
                }}
                dot={(props) => {
                  const {
                    stroke,
                    strokeLinecap,
                    strokeLinejoin,
                    strokeWidth,
                    cx,
                    cy,
                    dataKey,
                    index,
                  } = props;

                  if (
                    (hasOnlyOneValueForThisKey(data, category) &&
                      !(
                        activeDot ||
                        (activeLegend && activeLegend !== category)
                      )) ||
                    (activeDot?.index === index &&
                      activeDot?.dataKey === category)
                  ) {
                    return (
                      <Dot
                        key={index}
                        cx={cx}
                        cy={cy}
                        r={5}
                        stroke={stroke}
                        fill=""
                        strokeLinecap={strokeLinecap}
                        strokeLinejoin={strokeLinejoin}
                        strokeWidth={strokeWidth}
                        className={tremorTwMerge(
                          "stroke-tremor-background dark:stroke-dark-tremor-background",
                          onValueChange ? "cursor-pointer" : "",
                          getColorClassNames(
                            categoryColors.get(dataKey) ?? BaseColors.Gray,
                            colorPalette.text
                          ).fillColor
                        )}
                      />
                    );
                  }
                  return <Fragment key={index}></Fragment>;
                }}
                key={category}
                name={category}
                type={curveType}
                dataKey={category}
                stroke=""
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
                isAnimationActive={showAnimation}
                animationDuration={animationDuration}
                connectNulls={connectNulls}
              />
            ))}
            {onValueChange
              ? categories.map((category) => (
                  <Line
                    className={tremorTwMerge("cursor-pointer")}
                    strokeOpacity={0}
                    key={category}
                    name={category}
                    type={curveType}
                    dataKey={category}
                    stroke="transparent"
                    fill="transparent"
                    legendType="none"
                    tooltipType="none"
                    strokeWidth={12}
                    connectNulls={connectNulls}
                    onClick={(props, event) => {
                      event.stopPropagation();
                      const { name } = props;
                      onCategoryClick(name);
                    }}
                  />
                ))
              : null}
          </ReChartsLineChart>
        ) : (
          <NoData noDataText={noDataText} />
        )}
      </ResponsiveContainer>
    </div>
  );
});

SkyChart.displayName = "SkyChart";

export default SkyChart;

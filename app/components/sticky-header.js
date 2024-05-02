"use client";

import { useEffect, useState } from "react";
import {
  Title,
  Subtitle,
  Button,
  Metric,
  TextInput,
  Flex,
} from "@tremor/react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import LoadingBar from "./loading-bar";

export default function StickyHeader({
  title,
  subtitle,
  bigSubtitle,
  leftIcon,
  leftIconOnClick,
  rightIcons = [],
  search,
  searchValue,
  searchOnChange,
  loading = false,
  computing = false,
}) {
  const [scrollPosition, setScrollPosition] = useState(0);

  const handleScroll = () => {
    const position = window.pageYOffset;
    setScrollPosition(position);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div>
      <LoadingBar loading={loading} color={"rgb(34, 197, 94)"} />
      <LoadingBar loading={computing} color={"rgb(195, 217, 255)"} />
      <Flex
        className="sticky-top bg-slate-800 flex items-center justify-between w-full"
        style={{ padding: "8px 10px 8px 12px" }}
      >
        {leftIcon && (
          <Button
            onClick={leftIconOnClick}
            color="slate-800"
            icon={leftIcon}
          ></Button>
        )}

        <div
          style={{
            opacity: Math.min(1.0, scrollPosition / 60),
            transition: "opacity 0.5s",
            textAlign: leftIcon && rightIcons ? "center" : null,
          }}
        >
          <Title>{title}</Title>
          <Subtitle color="slate-400">{subtitle}</Subtitle>
        </div>
        {search && (
          <TextInput
            className="py-1"
            icon={MagnifyingGlassIcon}
            placeholder="Search..."
            value={searchValue}
            onChange={searchOnChange}
          />
        )}

        {!rightIcons && <div style={{ width: "50px" }}></div>}

        {rightIcons.length > 0 && (
          <div className="justify-end ml-auto">
            {rightIcons.map((v, i) => (
              <Button
                key={i}
                onClick={v.onClick}
                color="slate-800"
                icon={v.icon}
              ></Button>
            ))}
          </div>
        )}
      </Flex>

      <div
        className="bg-slate-800"
        style={{ padding: "0px 10px 0px 12px", marginTop: "4rem" }}
      >
        <Title>{title}</Title>
        {!bigSubtitle && <Subtitle color="slate-400">{subtitle}</Subtitle>}
        {bigSubtitle && <Metric>{subtitle}</Metric>}
      </div>
    </div>
  );
}

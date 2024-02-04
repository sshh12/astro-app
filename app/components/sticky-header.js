"use client";

import { useEffect, useState } from "react";
import { Title, Subtitle, Button, Metric, TextInput } from "@tremor/react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";

export default function StickyHeader({
  title,
  subtitle,
  bigSubtitle,
  leftIcon,
  leftIconOnClick,
  rightIcon,
  rightIconOnClick,
  search,
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
      <div
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
            textAlign: leftIcon && rightIcon ? "center" : null,
          }}
        >
          <Title>{title}</Title>
          <Subtitle>{subtitle}</Subtitle>
        </div>
        {search && (
          <TextInput
            className="py-1"
            icon={MagnifyingGlassIcon}
            placeholder="Search..."
          />
        )}

        {rightIcon && (
          <Button
            onClick={rightIconOnClick}
            color="slate-800"
            icon={rightIcon}
          ></Button>
        )}
      </div>

      <div
        className="bg-slate-800"
        style={{ padding: "0px 10px 0px 12px", marginTop: "4rem" }}
      >
        <Title>{title}</Title>
        {!bigSubtitle && <Subtitle>{subtitle}</Subtitle>}
        {bigSubtitle && <Metric>{subtitle}</Metric>}
      </div>
    </div>
  );
}

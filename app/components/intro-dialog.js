"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogPanel,
  Title,
  Button,
  Flex,
  List,
  ListItem,
} from "@tremor/react";
import { useNav } from "../nav";
import { useAnalytics, APP_VERSION } from "../api";

const SEEN_KEY = "astro-app:introSlides";
const SEEN_UPDATES_KEY = `astro-app:${APP_VERSION}:updateInfo`;

const UPDATE_TEXT = {
  title: "Updates",
  updates: [
    "Fixed issue with lists showing random items. As a result, some lists had be reset.",
  ],
};

const INTRO_SLIDES = [
  {
    title: "Astro App",
    text: "Welcome! The Astro App (early access) is a tool for exploring the night sky and tracking celestial events. It's primarily targeted for amateur astrophotographers.",
    nextText: "Next",
    nextOnClick: ({ nextSlide }) => nextSlide(),
    skipOnClick: ({ skipToEnd }) => skipToEnd(),
  },
  {
    title: "Sky Page",
    text: "On the main page you'll see an altitude chart. For all of your favorite objects this will show you how high they are in the sky for the upcoming night. Use the 3D view to explore their positions.",
    nextText: "Next",
    image: "/intro/alt-chart.png",
    nextOnClick: ({ nextSlide }) => nextSlide(),
    skipOnClick: ({ skipToEnd }) => skipToEnd(),
  },
  {
    title: "Space Objects",
    text: "Space objects will be shown with their name(s), tonight's max altitude, and a sky survey. You can edit this view by tapping the colored badge in the top right of these cards.",
    nextText: "Next",
    image: "/intro/object.png",
    nextOnClick: ({ nextSlide }) => nextSlide(),
    skipOnClick: ({ skipToEnd }) => skipToEnd(),
  },
  {
    title: "Lists",
    text: "You can use lists to group objects. When you click on the list you'll be able to see the altitude chart for all the objects in that list.",
    nextText: "Next",
    image: "/intro/list.png",
    nextOnClick: ({ nextSlide }) => nextSlide(),
    skipOnClick: ({ skipToEnd }) => skipToEnd(),
  },
  {
    title: "Weather",
    text: "On the location table you will be able to see live clouds and predicted weather data for the upcoming week.",
    nextText: "Next",
    image: "/intro/weather.png",
    nextOnClick: ({ nextSlide }) => nextSlide(),
    skipOnClick: ({ skipToEnd }) => skipToEnd(),
  },
  {
    title: "Location Access",
    text: "The app requires your location and preferred timezone for accurate astronomical calculations. If not, we'll start you off with a random location.",
    nextText: "Update Location",
    nextOnClick: ({ goToUpdateLocation }) => goToUpdateLocation(),
    skipOnClick: ({ close }) => close(),
  },
];

export default function IntroDialog() {
  const [open, setOpen] = useState(false);
  const [openUpdates, setOpenUpdates] = useState(false);
  const [slideIdx, setSlideIdx] = useState(0);
  const { setPage } = useNav();
  const emitEvent = useAnalytics();

  useEffect(() => {
    const seen = localStorage.getItem(SEEN_KEY);
    const seenUpdates = localStorage.getItem(SEEN_UPDATES_KEY);
    if (!seen) {
      setOpen(true);
    } else if (!seenUpdates) {
      setOpenUpdates(true);
    }
    console.log(SEEN_UPDATES_KEY, localStorage.getItem(SEEN_UPDATES_KEY));
  }, []);

  const slide = INTRO_SLIDES[slideIdx];

  const close = () => {
    setOpen(false);
    setOpenUpdates(false);
    emitEvent("intro_close");
    localStorage.setItem(SEEN_KEY, "true");
    localStorage.setItem(SEEN_UPDATES_KEY, "true");
  };
  const nextSlide = () => {
    if (slideIdx < INTRO_SLIDES.length - 1) {
      setSlideIdx(slideIdx + 1);
      emitEvent(`intro_next_slide_${slideIdx}`);
    } else {
      close();
    }
  };
  const back = () => {
    setSlideIdx(slideIdx - 1);
  };
  const skipToEnd = () => {
    setSlideIdx(INTRO_SLIDES.length - 1);
  };
  const goToUpdateLocation = () => {
    close();
    setPage("/profile", { openLocationSettings: true });
    emitEvent("intro_update_location");
  };
  const onClickOptions = { close, nextSlide, skipToEnd, goToUpdateLocation };

  return (
    <Dialog
      open={open || openUpdates}
      onClose={() => {
        if (open) {
          skipToEnd();
        } else {
          close();
        }
      }}
      static={true}
    >
      <DialogPanel>
        {open && (
          <>
            <Title className="mb-3">{slide.title}</Title>
            {slide.text}
            {slide.image && (
              <img
                src={slide.image}
                alt={slide.title + " image"}
                className="mt-2"
              />
            )}
            <Flex className="mt-3">
              {slideIdx > 0 && (
                <Button
                  variant="secondary"
                  onClick={() => back()}
                  color="slate"
                >
                  Back
                </Button>
              )}
              <Button
                variant="light"
                onClick={() => slide.skipOnClick(onClickOptions)}
                color="slate"
              >
                Skip
              </Button>
              <Button
                variant="primary"
                onClick={() => slide.nextOnClick(onClickOptions)}
              >
                {slide.nextText}
              </Button>
            </Flex>
          </>
        )}
        {openUpdates && (
          <>
            <Title className="mb-3">{UPDATE_TEXT.title}</Title>
            <List>
              {UPDATE_TEXT.updates.map((item, idx) => (
                <ListItem key={idx}>{item}</ListItem>
              ))}
            </List>
            <Flex className="mt-3">
              <Button variant="light" onClick={() => close()} color="slate">
                Close
              </Button>
            </Flex>
          </>
        )}
      </DialogPanel>
    </Dialog>
  );
}

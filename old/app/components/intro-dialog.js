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
import { useAnalytics, APP_VERSION, useAPI } from "../api";

export const SEEN_INTRO_KEY = "astro-app:introSlides";
const SEEN_UPDATES_KEY = `astro-app:${APP_VERSION}:updateInfo`;

const UPDATE_TEXT = {
  title: "Updates",
  updates: ["Full offline support and several performance improvements."],
};

const INTRO_SLIDES = [
  {
    title: "Astro App",
    text: "Welcome! The Astro App is a tool for exploring the night sky and tracking celestial events. It's primarily targeted for amateur astrophotographers.",
    nextText: "Next",
    nextOnClick: ({ nextSlide }) => nextSlide(),
    skipOnClick: null,
  },
  {
    title: "Sky Page",
    text: "On the main page you'll see an altitude chart. For all of your favorite objects this will show you how high they are in the sky for the upcoming night. Use the 3D view to explore their positions.",
    nextText: "Next",
    image: "/intro_icons/alt-chart.png",
    nextOnClick: ({ nextSlide }) => nextSlide(),
    skipOnClick: null,
  },
  {
    title: "Space Objects",
    text: "Space objects will be shown with their name(s), tonight's max altitude, and a sky survey. You can edit this view by tapping the colored badge in the top right of these cards.",
    nextText: "Next",
    image: "/intro_icons/object.gif",
    nextOnClick: ({ nextSlide }) => nextSlide(),
    skipOnClick: null,
  },
  {
    title: "Lists",
    text: "You can use lists to group objects. When you click on the list you'll be able to see the altitude chart for all the objects in that list.",
    nextText: "Next",
    image: "/intro_icons/list.png",
    nextOnClick: ({ nextSlide }) => nextSlide(),
    skipOnClick: null,
  },
  {
    title: "Search",
    text: "You can search for objects or look at pre-curated lists.",
    nextText: "Next",
    image: "/intro_icons/search.png",
    nextOnClick: ({ nextSlide }) => nextSlide(),
    skipOnClick: null,
  },
  {
    title: "Weather",
    text: "On the location table you will be able to see live clouds and predicted weather data for the upcoming week.",
    nextText: "Next",
    image: "/intro_icons/weather.png",
    nextOnClick: ({ nextSlide }) => nextSlide(),
    skipOnClick: null,
  },
  {
    title: "Equipment",
    text: "On the profile page you can set your observing equipment, sky survey images will automatically adjust to your equipment specs.",
    nextText: "Next",
    image: "/intro_icons/equipment.png",
    nextOnClick: ({ nextSlide }) => nextSlide(),
    skipOnClick: null,
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
  const { ready } = useAPI();
  const { setPage } = useNav();
  const emitEvent = useAnalytics();

  useEffect(() => {
    const seen = localStorage.getItem(SEEN_INTRO_KEY);
    const seenUpdates = localStorage.getItem(SEEN_UPDATES_KEY);
    if (!seen) {
      setOpen(true);
    } else if (!seenUpdates) {
      setOpenUpdates(true);
    }
  }, []);

  const slide = INTRO_SLIDES[slideIdx];

  const close = () => {
    setOpen(false);
    setOpenUpdates(false);
    emitEvent("intro_close");
    localStorage.setItem(SEEN_INTRO_KEY, "true");
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
  const apiNotReady = !ready && slideIdx === INTRO_SLIDES.length - 1;
  const firstOrLast = slideIdx === 0 || slideIdx === INTRO_SLIDES.length - 1;

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
            <div style={firstOrLast ? {} : { height: "36rem" }}>
              {slide.text}
              {slide.image && (
                <img
                  src={slide.image}
                  alt={slide.title + " image"}
                  className="mt-2 border-2 border-slate-600"
                />
              )}
            </div>
            <Flex className="mt-3">
              <Button
                variant="secondary"
                onClick={() => back()}
                color="slate"
                disabled={slideIdx === 0}
              >
                Back
              </Button>
              {slide.skipOnClick && (
                <Button
                  variant="light"
                  onClick={() => slide.skipOnClick(onClickOptions)}
                  color="slate"
                  disabled={apiNotReady}
                >
                  Skip
                </Button>
              )}
              {apiNotReady ? (
                <Button variant="primary" disabled={true}>
                  One moment...
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={() => slide.nextOnClick(onClickOptions)}
                >
                  {slide.nextText}
                </Button>
              )}
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

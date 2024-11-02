import {
  Box,
  Card,
  Divider,
  Stack,
  Step,
  StepIndicator,
  Stepper,
  Tooltip,
  Typography,
} from "@mui/joy";
import Skeleton from "@mui/joy/Skeleton";
import React from "react";
import BaseLocationPage from "../components/BaseLocationPage";
import { useCachedPythonOutput } from "../providers/python";
import {
  renderDate,
  renderTime,
  renderTimeTill,
  useCurrentObservingWindow,
  useTimestamp,
} from "../utils/date";

function TonightEvents({ location }) {
  const { ts } = useTimestamp();
  const [startTs, endTs] = useCurrentObservingWindow(location?.timezone);
  const { result: events, stale: eventsStale } = useCachedPythonOutput(
    "get_events_sky_darkness",
    location && {
      start_ts: startTs,
      end_ts: endTs,
      timezone: location.timezone,
      lat: location.lat,
      lon: location.lon,
      elevation: location.elevation,
    },
    {
      cacheKey: `skyDarkness_${startTs}_${endTs}_${location?.id}`,
      staleCacheKey: `skyDarkness`,
    }
  );
  const eventIdxNow = (events || []).findLastIndex((event) => event.ts < ts);

  return (
    <Card>
      <Box>
        <Stack direction="row" justifyContent="space-between">
          <Typography level="title-md">Tonight's Events</Typography>
        </Stack>
      </Box>
      <Divider />
      <Stepper orientation="vertical">
        {(events || []).map((event, idx) => (
          <Step
            key={event.ts}
            indicator={
              eventIdxNow === idx ? (
                <StepIndicator
                  variant="solid"
                  color="primary"
                  size={"sm"}
                  sx={{ height: "0.5rem", width: "0.5rem" }}
                ></StepIndicator>
              ) : null
            }
          >
            <div>
              <Tooltip
                title={event.tooltip}
                enterTouchDelay={100}
                enterDelay={100}
                sx={{ maxWidth: "400px" }}
              >
                {eventsStale ? (
                  <Skeleton variant="text"></Skeleton>
                ) : (
                  <Typography level="title-sm">{event.title}</Typography>
                )}
              </Tooltip>
              {!eventsStale && (
                <Typography level="body-xs">
                  {renderDate(event.ts, location?.timezone)}{" "}
                  {renderTime(event.ts, location?.timezone)}
                  {eventIdxNow === idx &&
                    ` (now ${renderTime(ts, location?.timezone)})`}
                  {event.ts > ts &&
                    eventIdxNow < idx &&
                    ` (in ${renderTimeTill(ts, event.ts)})`}
                </Typography>
              )}
            </div>{" "}
          </Step>
        ))}
      </Stepper>
    </Card>
  );
}

export default function LocationEventsPage() {
  const { location } = useBackend();
  return (
    <BaseLocationPage tabIdx={2}>
      <TonightEvents location={location} />
    </BaseLocationPage>
  );
}

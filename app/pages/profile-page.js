"use client";

import React, { useEffect } from "react";
import { Grid } from "@tremor/react";
import {
  MapPinIcon,
  UserCircleIcon,
  FlagIcon,
} from "@heroicons/react/24/solid";
import StickyHeader from "../components/sticky-header";
import SettingsCard from "../components/settings-card";
import LinkCard from "../components/link-card";
import { useAPI } from "../api";
import { useNav } from "../nav";

export default function ProfilePage() {
  const { ready, user, postThenUpdateUser } = useAPI();
  const { pageParams } = useNav();

  const [accountSettingsOpen, setAccountSettingsOpen] = React.useState(false);
  const [locationSettingsOpen, setLocationSettingsOpen] = React.useState(false);

  const saveAccountSettings = (settings) => {
    setAccountSettingsOpen(false);
    postThenUpdateUser("update_user", settings);
  };

  const saveLocationSettings = (settings) => {
    setLocationSettingsOpen(false);
    postThenUpdateUser("update_user_location", settings);
  };

  useEffect(() => {
    if (pageParams.openLocationSettings) {
      setLocationSettingsOpen(true);
    }
  }, [pageParams.openLocationSettings]);

  return (
    <div className="bg-slate-800" style={{ paddingBottom: "6rem" }}>
      <StickyHeader
        title="Profile"
        subtitle={user ? "@" + user.name : ""}
        loading={!ready}
      />

      <Grid numItemsMd={2} numItemsLg={3} className="mt-2 gap-1 ml-2 mr-2">
        <SettingsCard
          title="Account"
          icon={UserCircleIcon}
          color="orange"
          items={[
            { name: "USERNAME", value: user?.name, key: "name", type: "text" },
          ]}
          open={accountSettingsOpen}
          setOpen={setAccountSettingsOpen}
          onSave={saveAccountSettings}
        />
        <SettingsCard
          title="Location"
          icon={MapPinIcon}
          color="blue"
          open={locationSettingsOpen}
          setOpen={setLocationSettingsOpen}
          onSave={saveLocationSettings}
          items={[
            {
              name: "TIMEZONE",
              key: "timezone",
              value: user?.timezone,
              type: "select-timezone",
            },
            { name: "LATITUDE", key: "lat", value: user?.lat, type: "number" },
            { name: "LONGITUDE", key: "lon", value: user?.lon, type: "number" },
            {
              name: "ELEVATION (m)",
              key: "elevation",
              value: user?.elevation || 0,
              type: "number",
            },
          ]}
        />
        <LinkCard
          title="Feedback"
          subtitle="Share feedback or submit a feature request."
          color="purple"
          icon={FlagIcon}
          onClick={() =>
            (window.location.href = "https://forms.gle/KFnRddtrbLVANPdJA")
          }
        />
      </Grid>
    </div>
  );
}

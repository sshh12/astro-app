"use client";

import React, { useEffect, useState } from "react";
import { Grid } from "@tremor/react";
import {
  MapPinIcon,
  UserCircleIcon,
  FlagIcon,
  AcademicCapIcon,
  HeartIcon,
  CameraIcon,
  CommandLineIcon,
} from "@heroicons/react/24/solid";
import StickyHeader from "../components/sticky-header";
import SettingsCard from "../components/settings-card";
import EquipSettingsCard from "../components/equip-settings-card";
import LinkCard from "../components/link-card";
import { useAPI } from "../api";
import { useNav } from "../nav";
import { usePython } from "../python";
import { SEEN_INTRO_KEY } from "../components/intro-dialog";

export default function ProfilePage() {
  const { ready, user, postThenUpdateUser } = useAPI();
  const { pageParams } = useNav();

  const { ready: pythonReady, asyncRun } = usePython();
  const [exp, setExp] = useState("Not Yet Loaded");
  useEffect(() => {
    if (pythonReady) {
      asyncRun.current("from astro_app.api import test; test()").then((res) => {
        console.log(res);
        setExp(res.results);
      });
    }
  }, [pythonReady]);

  const [accountSettingsOpen, setAccountSettingsOpen] = React.useState(false);
  const [locationSettingsOpen, setLocationSettingsOpen] = React.useState(false);
  const [equipSettingsOpen, setEquipSettingsOpen] = React.useState(false);

  const saveAccountSettings = (settings) => {
    setAccountSettingsOpen(false);
    postThenUpdateUser("update_user", settings);
  };

  const saveLocationSettings = (settings) => {
    setLocationSettingsOpen(false);
    postThenUpdateUser("update_user_location", settings);
  };

  const addEquipment = (equip) => {
    setEquipSettingsOpen(false);
    postThenUpdateUser("add_equipment", { equipment_details: equip });
  };

  const deleteEquipment = (equip) => {
    if (confirm(`Are you sure you want to delete?`)) {
      setEquipSettingsOpen(false);
      postThenUpdateUser("delete_equipment", { id: equip.id });
    }
  };

  const setActiveEquipment = (equip) => {
    setEquipSettingsOpen(false);
    postThenUpdateUser("set_active_equipment", { id: equip.id });
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
        <EquipSettingsCard
          title="Equipment"
          icon={CameraIcon}
          color="slate"
          open={equipSettingsOpen}
          setOpen={setEquipSettingsOpen}
          onAdd={addEquipment}
          onDelete={deleteEquipment}
          setActive={setActiveEquipment}
        />
        <LinkCard
          title="Tutorial"
          subtitle="Tap to play the intro tutorial."
          color="green"
          icon={AcademicCapIcon}
          onClick={() => {
            localStorage.setItem(SEEN_INTRO_KEY, "");
            window.location.reload();
          }}
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
        <LinkCard
          title="Acknowledgements"
          subtitle="Thanks to HiPS2FITS for sky survey data, wikipedia for object descriptions, and astronomy.tools for equipment data."
          color="red"
          icon={HeartIcon}
          truncate={false}
          onClick={() => {
            alert("❤️");
          }}
        />
        <LinkCard
          title="Experimental Offline Support"
          subtitle={exp}
          color="yellow"
          icon={CommandLineIcon}
          truncate={false}
          onClick={() => {}}
        />
      </Grid>
    </div>
  );
}

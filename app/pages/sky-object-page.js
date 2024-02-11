"use client";

import React, { useEffect, useState } from "react";
import {
  PlusIcon,
  ArrowUturnLeftIcon,
  ListBulletIcon,
} from "@heroicons/react/24/solid";
import { useNav } from "../nav";
import SkyChart from "../components/sky-chart";
import StickyHeader from "../components/sticky-header";
import { useAPI } from "../api";
import ListDialog from "../components/list-dialog";

export default function SkyObjectPage() {
  const { pageParams, setPage } = useNav();
  const { user, post, ready } = useAPI();
  const [object, setObject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openListDialog, setOpenListDialog] = useState(false);

  useEffect(() => {
    post("get_space_object", { id: pageParams.id }).then((object) => {
      setObject(object);
      setLoading(false);
    });
  }, []);

  const isOnList = user?.lists.find((list) =>
    list.objects.find((obj) => obj.id === pageParams.id)
  );

  return (
    <div className="bg-slate-800" style={{ paddingBottom: "6rem" }}>
      <StickyHeader
        title={pageParams.name}
        subtitle={""}
        leftIcon={ArrowUturnLeftIcon}
        leftIconOnClick={() => setPage("/sky")}
        rightIcon={isOnList ? ListBulletIcon : PlusIcon}
        rightIconOnClick={() => setOpenListDialog(true)}
        loading={loading || !ready}
      />

      {object && (
        <ListDialog
          object={object}
          open={openListDialog}
          setOpen={setOpenListDialog}
        />
      )}

      <div className="pb-6">
        {object && (
          <SkyChart
            className="mt-6"
            times={object.orbits.time}
            timeStates={object.orbits.time_state}
            timezone={object.orbits.timezone}
            objects={[
              {
                alt: object.orbits.objects[object.id].alt,
                name: object.name,
                color: "green",
              },
            ]}
          />
        )}
        {!object && (
          <SkyChart className="mt-6" times={[]} timeStates={[]} objects={[]} />
        )}
      </div>
    </div>
  );
}

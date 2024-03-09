"use client";

import React, { useState } from "react";
import {
  ArrowUturnLeftIcon,
  ShareIcon,
  PlusIcon,
  TrashIcon,
  LinkIcon,
} from "@heroicons/react/24/solid";
import { Grid, Title, Flex } from "@tremor/react";
import { useNav } from "../nav";
import SkyChartPanel from "../components/sky-chart-panel";
import StickyHeader from "../components/sticky-header";
import ObjectCard from "../components/object-card";
import ShareLinkDialog from "../components/share-link-dialog";
import { useAPI, usePostWithCache } from "../api";
import LinkCard from "../components/link-card";

export default function SkyListPage() {
  const { pageParams, setPage } = useNav();
  const [openShare, setOpenShare] = useState(false);
  const { user, postThenUpdateUser } = useAPI();
  const [loading, setLoading] = useState(false);

  const [listReady, list] = usePostWithCache(pageParams.id && "get_list", {
    id: pageParams.id,
  });

  const addList = () => {
    setLoading(true);
    postThenUpdateUser("add_list", { id: pageParams.id }).then(() => {
      setLoading(false);
      setPage("/sky");
    });
  };

  const deleteList = () => {
    if (window.confirm("Are you sure you want to delete this list?")) {
      setLoading(true);
      postThenUpdateUser("delete_list", { id: pageParams.id }).then(() => {
        setLoading(false);
        setPage("/sky");
      });
    }
  };

  const ownedList = user && user.lists.find((l) => l.id === pageParams.id);
  const rightIcons = [];

  if (!ownedList && !loading) {
    rightIcons.push({ icon: PlusIcon, onClick: () => addList() });
  }

  if (ownedList && !loading) {
    rightIcons.push({ icon: TrashIcon, onClick: () => deleteList() });
    rightIcons.push({ icon: ShareIcon, onClick: () => setOpenShare(true) });
  }

  return (
    <div className="bg-slate-800" style={{ paddingBottom: "6rem" }}>
      <StickyHeader
        title={list?.title || pageParams.title}
        subtitle={""}
        leftIcon={ArrowUturnLeftIcon}
        leftIconOnClick={() => setPage("/sky")}
        loading={!listReady || loading}
        rightIcons={rightIcons}
      />

      <ShareLinkDialog
        open={openShare}
        setOpen={setOpenShare}
        path={`/sky/list?id=${list?.id}`}
        title={`Share ${list?.title}`}
      />

      <div className="pb-5 mt-6">
        {list?.orbits?.time && (
          <SkyChartPanel
            times={list.orbits.time}
            timeStates={list.orbits.time_state}
            timezone={list.orbits.timezone}
            objects={list.objects.map((obj) => ({
              alt: list.orbits.objects[obj.id].alt,
              az: list.orbits.objects[obj.id].az,
              name: obj.name,
              color: obj.color,
            }))}
          />
        )}
        {!list && <SkyChartPanel times={[]} timeStates={[]} objects={[]} />}
      </div>

      <div style={{ height: "1px" }} className="w-full bg-gray-500"></div>

      <div className="ml-2 mr-2">
        {list && (
          <>
            <div className="mt-5">
              <Title>Sky Objects</Title>
            </div>
            {list && (
              <Grid numItemsMd={2} numItemsLg={3} className="mt-2 gap-1">
                {list.objects.map((obj) => (
                  <ObjectCard key={obj.id} object={obj} orbits={list.orbits} />
                ))}
              </Grid>
            )}
          </>
        )}

        {list && list.credit && !ownedList && (
          <Flex className="mt-3">
            <LinkCard
              title={"View Source"}
              subtitle={list?.credit}
              link={list?.credit}
              color={"purple"}
              icon={LinkIcon}
            />
          </Flex>
        )}
      </div>
    </div>
  );
}

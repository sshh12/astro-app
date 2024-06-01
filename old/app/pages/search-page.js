"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Title, Text, Flex, Badge } from "@tremor/react";
import { ArrowUturnLeftIcon } from "@heroicons/react/24/solid";
import { useNav } from "../nav";
import { useCallWithCache } from "../python";
import { useAPI } from "../api";
import StickyHeader from "../components/sticky-header";
import { useDebounce, objectAKA } from "../utils";
import ObjectsList from "../components/objects-list";
import { LISTS } from "./../data/lists";

function ListBadge({ list, onClick }) {
  return (
    <Badge
      size="xl"
      color="gray-700"
      className="border-2 border-gray-300 py-2 cursor-pointer mr-2"
      onClick={onClick}
      icon={() => (
        <img
          src={list.imgURL}
          alt={`icon for list ${list.title}`}
          className="h-5 rounded-lg mr-2"
        />
      )}
    >
      <Text color="gray-100" className="text-lg">
        {list.title}
      </Text>
    </Badge>
  );
}

function ListBadgeGroup({ title, lists, maxRows }) {
  const { setPage } = useNav();
  const rows = [];
  if (lists) {
    const chunkSize = Math.ceil(lists.length / maxRows);
    for (let i = 0; i < maxRows; i++) {
      rows.push(lists.slice(i * chunkSize, (i + 1) * chunkSize));
    }
  }
  return (
    <div>
      <div className="mt-5 mb-2">
        <Title>{title}</Title>
      </div>
      <Flex className="overflow-x-scroll flex-col">
        {rows.map((row, i) => (
          <Flex key={i} className="mb-2 justify-start flex-row">
            {row.map((list) => (
              <ListBadge
                key={list.id}
                list={list}
                onClick={() =>
                  setPage("/sky/list", { id: list.id, title: list.title })
                }
              />
            ))}
          </Flex>
        ))}
      </Flex>
    </div>
  );
}

const cleanSearchTerm = (term) => {
  if (term.startsWith("NAME ")) {
    term = term.slice(5);
  }
  return term.replace(/[^\w0-9]+/g, "").toLowerCase();
};

const scoreSimilarity = (query, obj) => {
  const aka = objectAKA(obj).map((name) => name.toLowerCase());
  const names = obj.names.map((name) => name.toLowerCase());
  const queryLowerCase = query.toLowerCase();
  if (obj.name.toLowerCase().includes(queryLowerCase)) {
    return 1000;
  } else if (aka.includes(queryLowerCase)) {
    return 100;
  } else if (names.includes(queryLowerCase)) {
    return 10;
  }
  return 0;
};

export default function SearchPage() {
  const { goBack } = useNav();
  const { post, location, objectStore, listStore } = useAPI();

  const [searchValue, setSearchValue] = useState("");
  const debouncedSearchTerm = useDebounce(searchValue, 500);
  const [matchingObjects, setMatchingObjects] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (objectStore && listStore) {
      const objects = LISTS.reduce((acc, list) => {
        return list.objects ? acc.concat(list.objects) : acc;
      }, []);
      Promise.all(objects.map((obj) => objectStore.setItem(obj.id, obj)));
      Promise.all(LISTS.map((list) => listStore.setItem(list.id, list)));
    }
  }, [objectStore, listStore]);

  useEffect(() => {
    if (matchingObjects && objectStore) {
      Promise.all(
        matchingObjects.map((obj) => objectStore.setItem(obj.id, obj))
      );
    }
  }, [matchingObjects, objectStore]);

  useEffect(() => {
    if (debouncedSearchTerm && post && objectStore) {
      const cleanTerm = cleanSearchTerm(debouncedSearchTerm);
      setLoading(true);
      setMatchingObjects([]);
      objectStore.iterate((val) => {
        if (val.searchKey.includes(cleanTerm)) {
          setMatchingObjects((prevMatches) => {
            const newMatches = [val].filter(
              (obj) => !prevMatches.find((m) => m.id === obj.id)
            );
            return [...prevMatches, ...newMatches];
          });
        }
      });
      post("search", { term: cleanTerm })
        .then((searchResults) => {
          const searchObjs = searchResults.objects;
          setMatchingObjects((prevMatches) => {
            const newMatches = searchObjs.filter(
              (obj) => !prevMatches.find((m) => m.id === obj.id)
            );
            return [...prevMatches, ...newMatches];
          });
          setLoading(false);
        })
        .catch((e) => console.error(e));
    }
  }, [debouncedSearchTerm, post, objectStore]);

  const matchingObjectsShown = useMemo(() => {
    const objectsToShow = [...matchingObjects]
      .sort(
        (a, b) =>
          scoreSimilarity(debouncedSearchTerm, b) -
          scoreSimilarity(debouncedSearchTerm, a)
      )
      .slice(0, 16);
    return objectsToShow;
  }, [matchingObjects, debouncedSearchTerm]);

  const { result: resultOrbits, ready: resultOrbitsReady } = useCallWithCache(
    "get_orbit_calculations",
    debouncedSearchTerm && debouncedSearchTerm + "_orbits",
    matchingObjectsShown &&
      location && {
        objects: matchingObjectsShown,
        timezone: location.timezone,
        lat: location.lat,
        lon: location.lon,
        elevation: location.elevation,
        resolution_mins: 10,
      }
  );

  const curatedLists = useMemo(() => {
    return LISTS.filter((list) => list.type === "CURATED_LIST");
  }, []);

  const constellationList = useMemo(() => {
    return LISTS.filter((list) => list.type === "CONSTELLATION_GROUP");
  }, []);

  return (
    <div className="bg-slate-800" style={{ paddingBottom: "6rem" }}>
      <StickyHeader
        title=""
        subtitle={""}
        leftIcon={ArrowUturnLeftIcon}
        leftIconOnClick={() => goBack()}
        search={true}
        searchValue={searchValue}
        searchOnChange={(event) => setSearchValue(event.target.value)}
        loading={loading}
        computing={
          debouncedSearchTerm &&
          matchingObjectsShown.length > 0 &&
          !resultOrbitsReady
        }
      />

      <div className="ml-2 mr-2">
        {!searchValue && (
          <Flex className="justify-around">
            <Text color="gray-200">Searches are powered by SIMBAD</Text>
          </Flex>
        )}

        {debouncedSearchTerm && matchingObjectsShown.length > 0 && (
          <ObjectsList
            title="Results"
            objects={matchingObjectsShown}
            orbits={resultOrbits}
            keepOrder={true}
          />
        )}

        {curatedLists.length > 0 && (
          <ListBadgeGroup
            title={"Curated Lists"}
            lists={curatedLists}
            maxRows={3}
          />
        )}
      </div>
    </div>
  );
}

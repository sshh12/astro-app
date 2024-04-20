"use client";

import React, { useEffect, useState } from "react";
import { Title, Text, Flex, Badge } from "@tremor/react";
import { ArrowUturnLeftIcon } from "@heroicons/react/24/solid";
import { useNav } from "../nav";
import { useCallWithCache } from "../python";
import { useAPI, usePostWithCache } from "../api";
import StickyHeader from "../components/sticky-header";
import { useDebounce } from "../utils";
import ObjectsList from "../components/objects-list";

function ListBadge({ list, onClick }) {
  return (
    <Badge
      size="xl"
      color="gray-700"
      className="border-2 border-gray-300 py-2 cursor-pointer mr-2"
      onClick={onClick}
      icon={() => <img src={list.imgURL} className="h-5 rounded-lg mr-2" />}
    >
      <Text color="gray-100" className="text-lg">
        {list.title}
      </Text>
    </Badge>
  );
}

export default function SearchPage() {
  const { setPage, goBack } = useNav();
  const { post, user } = useAPI();

  const [searchValue, setSearchValue] = useState("");
  const debouncedSearchTerm = useDebounce(searchValue, 500);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const [publicListsReady, publicLists] = usePostWithCache("get_public_lists");

  useEffect(() => {
    if (debouncedSearchTerm) {
      setLoading(true);
      post("search", { term: debouncedSearchTerm }).then((results) => {
        setResults(results);
        setLoading(false);
      });
    }
  }, [debouncedSearchTerm, post]);

  const { result: resultOrbits, ready: resultOrbitsReady } = useCallWithCache(
    results && user && "get_orbit_calculations",
    searchValue + "_orbits",
    results &&
      user && {
        objects: results.objects,
        timezone: user.timezone,
        lat: user.lat,
        lon: user.lon,
        elevation: user.elevation,
        resolution_mins: 10,
      }
  );

  const publicListsRows = [];
  if (publicLists) {
    const totalChunks = 3;
    const chunkSize = Math.ceil(publicLists.lists.length / totalChunks);
    for (let i = 0; i < totalChunks; i++) {
      publicListsRows.push(
        publicLists.lists.slice(i * chunkSize, (i + 1) * chunkSize)
      );
    }
  }

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
        loading={loading || !publicLists || (results && !resultOrbitsReady)}
      />

      <div className="ml-2 mr-2">
        {!results && (
          <Flex className="justify-around">
            <Text color="gray-200">Searches are powered by SIMBAD</Text>
          </Flex>
        )}

        {results && resultOrbits && (
          <ObjectsList
            title="Results"
            objects={results.objects}
            orbits={resultOrbits}
          />
        )}

        {publicLists && (
          <>
            <div className="mt-5 mb-2">
              <Title>Curated Lists</Title>
            </div>
            <Flex className="overflow-x-scroll flex-col">
              {publicListsRows.map((row, i) => (
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
          </>
        )}
      </div>
    </div>
  );
}

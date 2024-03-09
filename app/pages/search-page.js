"use client";

import React, { useEffect, useState } from "react";
import { Grid, Title, Text, Flex, Badge } from "@tremor/react";
import { ArrowUturnLeftIcon } from "@heroicons/react/24/solid";
import { useNav } from "../nav";
import { useAPI, usePostWithCache } from "../api";
import StickyHeader from "../components/sticky-header";
import { useDebounce } from "../utils";
import ObjectCard from "../components/object-card";

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
  const { setPage } = useNav();
  const { post } = useAPI();

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
        leftIconOnClick={() => setPage("/sky")}
        search={true}
        searchValue={searchValue}
        searchOnChange={(event) => setSearchValue(event.target.value)}
        loading={loading || !publicLists}
      />

      <div className="ml-2 mr-2">
        {!results && (
          <Flex className="justify-around">
            <Text color="gray-200">Searches are powered by SIMBAD</Text>
          </Flex>
        )}

        {results && (
          <>
            <div className="mt-5">
              <Title>Results</Title>
            </div>
            <Grid numItemsMd={2} numItemsLg={3} className="mt-2 gap-1">
              {results.objects.map((obj) => (
                <ObjectCard key={obj.id} object={obj} orbits={results.orbits} />
              ))}
            </Grid>
          </>
        )}

        {publicLists && (
          <>
            <div className="mt-5 mb-2">
              <Title>Curated Lists</Title>
            </div>
            <Flex className="overflow-x-scroll flex-col">
              {publicListsRows.map((row, i) => (
                <Flex key={i} className="mb-2">
                  {row.map((list) => (
                    <ListBadge
                      key={list.id}
                      list={list}
                      onClick={() => setPage("/sky/list", { id: list.id })}
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

"use client";

import React, { useEffect, useState } from "react";
import { Grid, Title } from "@tremor/react";
import { ArrowUturnLeftIcon, CircleStackIcon } from "@heroicons/react/24/solid";
import { useNav } from "../nav";
import { useAPI } from "../api";
import StickyHeader from "../components/sticky-header";
import { useDebounce } from "../utils";
import ObjectCard from "../components/object-card";
import LinkCard from "../components/link-card";

export default function SearchPage() {
  const { setPage } = useNav();
  const { post } = useAPI();

  const [searchValue, setSearchValue] = useState("");
  const debouncedSearchTerm = useDebounce(searchValue, 1000);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (debouncedSearchTerm) {
      setLoading(true);
      post("search", { term: debouncedSearchTerm }).then((results) => {
        setResults(results);
        setLoading(false);
      });
    }
  }, [debouncedSearchTerm, post]);

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
        loading={loading}
      />

      {!results && (
        <Grid numItemsMd={2} numItemsLg={3} className="mt-2 gap-1 ml-2 mr-2">
          <LinkCard
            title="SIMBAD"
            subtitle="Searches are powered by SIMBAD"
            color="purple"
            icon={CircleStackIcon}
            onClick={() =>
              (window.location.href = "https://simbad.cds.unistra.fr/simbad/")
            }
          />
        </Grid>
      )}

      {results && (
        <>
          <div className="mt-5 ml-2 mr-2">
            <Title>Results</Title>
          </div>
          <Grid numItemsMd={2} numItemsLg={3} className="mt-2 gap-1 ml-2 mr-2">
            {results.objects.map((obj) => (
              <ObjectCard
                key={obj.id}
                object={obj}
                orbits={results.orbits}
                showExpanded={false}
              />
            ))}
          </Grid>
        </>
      )}
    </div>
  );
}

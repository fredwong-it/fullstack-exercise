import React, { useEffect, useState } from "react";
import { useData } from "../state/DataContext";
import { Link } from "react-router-dom";
import { FixedSizeList as List } from "react-window";
import { PAGE_SIZE } from "../utils/pagination";
import { Skeleton } from "./Skeleton";

function Items() {
  const { items, fetchItems } = useData();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const ac = new AbortController();

    setLoading(true);

    fetchItems({ page, size: PAGE_SIZE, q, signal: ac.signal })
      .then((total) => setTotal(total))
      .catch((e) => {
        if (e.name !== "AbortError") console.error(e);
      })
      .finally(() => setLoading(false));

    // Clean‑up to avoid memory leak
    return () => {
      ac.abort();
    };
  }, [fetchItems, q, page]);

  // debounce: update q 300ms after user stops typing
  useEffect(() => {
    setPage(1);

    const t = setTimeout(() => setQ(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const handleReset = () => setSearch("");

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => p + 1);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const searchInput = (
    <input
    placeholder="Search…"
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    style={{
      marginTop: 12,
      marginBottom: 12,
      marginRight: 8,
      width: "100%",
      maxWidth: 360,
    }}
    aria-label="Search items"
  />
  )

  // --- First-load state ---
  if (loading && items.length === 0) {
    return (
      <div role="status" aria-busy="true" >
        {searchInput}
        <div style={{ display: 'flex', flexDirection:'column', gap: 16 }}>
          {Array.from({ length: 12 }).map(() => <Skeleton height={24} />)}
        </div>
      </div>
    );
  }

  const itemCount = Math.max(items.length, 1); // avoid 0 itemCount crash

  return (
    <div>
      <div>
        {searchInput}
        <button onClick={handleReset} style={{ cursor: "pointer" }}>
          Reset
        </button>
      </div>
      {items.length > 0 ? (
        <>
          <List
            height={480}
            width={"100%"}
            itemCount={itemCount}
            itemSize={40}
          >
            {({ index, style }) => (
              <div style={style}>
                <Link to={"/items/" + items[index].id}>
                  {items[index].name}
                </Link>
              </div>
            )}
          </List>
          <div style={{ marginTop: 12 }}>
            <button
              onClick={handlePrev}
              disabled={page <= 1}
              style={{ cursor: "pointer" }}
            >
              Prev
            </button>
            <span style={{ margin: "0 8px" }}>
              Page {page} of {totalPages || 1}
            </span>
            <button
              onClick={handleNext}
              disabled={page >= totalPages}
              style={{ cursor: "pointer" }}
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <div>No Result!</div>
      )}
    </div>
  );
}

export default Items;

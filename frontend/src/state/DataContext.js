import React, { createContext, useCallback, useContext, useState } from "react";
import { PAGE_SIZE } from "../utils/pagination";

const DataContext = createContext();

export function DataProvider({ children }) {
  const [items, setItems] = useState([]);

  const fetchItems = useCallback(async ({ page = 1, size = PAGE_SIZE, q = "", signal } = {}) => {
    const params = new URLSearchParams({
      page: String(page),
      size: String(size),
      ...(q ? { q } : {}),
    });

    const res = await fetch(`http://localhost:4001/api/items?${params.toString()}`, {
      signal,
    });

    const { items, total } = await res.json();
    setItems(items);

    return total;
  }, []);

  return (
    <DataContext.Provider value={{ items, fetchItems }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => {
  const context = useContext(DataContext);
  
  if (context === undefined) {
      throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

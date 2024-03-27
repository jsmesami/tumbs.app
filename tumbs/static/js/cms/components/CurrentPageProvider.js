import React, { createContext, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export const PageContext = createContext(null);

const CurrentPageProvider = ({ website, children }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const findPage = (id) => website.pages.find((pg) => pg.id === id);
  const pageId = parseInt(searchParams.get("page"));
  const currentPage = findPage(pageId) || website?.pages[0];

  useEffect(() => {
    setCurrentPage(currentPage?.id);
  }, []);

  const setCurrentPage = (id) => {
    const pg = findPage(parseInt(id));

    if (pg) {
      setSearchParams({ page: pg.id });
    }
  };

  return <PageContext.Provider value={{ currentPage, setCurrentPage }}>{children}</PageContext.Provider>;
};

export default CurrentPageProvider;

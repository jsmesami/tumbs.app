import React, { createContext } from "react";
import { useSearchParams } from "react-router-dom";
import Hashids from "hashids";

const hashids = new Hashids("CurrentPage", 5);
export const PageContext = createContext(null);

const CurrentPageProvider = ({ website, children }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const findPage = (id) => website.pages.find((pg) => pg.id === id);
  const pageId = hashids.decode(searchParams.get("page"));
  const currentPage = findPage(parseInt(pageId)) || website?.pages[0];

  const setCurrentPage = (id) => {
    const pg = findPage(parseInt(id));
    if (pg) {
      setSearchParams({ ...searchParams, ...{ page: hashids.encode(pg.id) } });
    }
  };

  return <PageContext.Provider value={{ currentPage, setCurrentPage }}>{children}</PageContext.Provider>;
};

export default CurrentPageProvider;

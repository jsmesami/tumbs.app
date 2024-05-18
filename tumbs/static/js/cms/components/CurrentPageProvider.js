import React, { createContext } from "react";
import { useSearchParams } from "react-router-dom";
import shortenUuid from "shorten-uuid";

const { encode, decode } = shortenUuid();

export const PageContext = createContext(null);

const CurrentPageProvider = ({ website, children }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const findPage = (id) => website.pages.find((pg) => pg.id === id);
  const pageQS = searchParams.get("page");
  const pageId = pageQS ? decode(pageQS) : undefined;
  const currentPage = findPage(pageId) || website?.pages[0];

  const setCurrentPage = (id) => {
    const pg = findPage(id);
    if (pg) {
      setSearchParams({ ...searchParams, ...{ page: encode(pg.id) } });
    }
  };

  return <PageContext.Provider value={{ currentPage, setCurrentPage }}>{children}</PageContext.Provider>;
};

export default CurrentPageProvider;

import { useLocalStorage } from "../shared/hooks";
import { VscLock } from "react-icons/vsc";
import { useContext } from "react";
import { Bundlr } from "../contexts/Bundlr";
import { BsFolder2Open } from "react-icons/bs";
import { IoCloudUploadOutline } from "react-icons/io5";
import { Link } from "react-router-dom";
import { HiOutlineExternalLink } from "react-icons/hi";
import { formatBytes, pluralize } from "../shared/helpers";
import { formatRelative } from "date-fns";

function Sites() {
  const bundlr = useContext(Bundlr);
  // We store sites locally because it takes time for a transaction to get indexed on L1, the devs are on it and we'll switch to the GraphQL API once that improves.
  const [sites] = useLocalStorage<Site[]>("sites", []);

  return bundlr && sites.length ? (
    <>
      {sites.map((site) => (
        <div
          key={site.id}
          className="border-2 border-muted rounded-3xl transition-transform flex flex-col mb-7"
        >
          <div className="flex justify-between items-center p-4">
            <h1 className="truncate">Site ID: {site.id}</h1>
            <a
              className="btn mt-0 flex-shrink-0"
              href={`https://arweave.net/${site.id}`}
              target="_blank"
            >
              <HiOutlineExternalLink />
              Open site
            </a>
          </div>
          <div className="p-4 border-t-2 border-muted flex justify-between text-gray-300 flex-col sm:flex-row">
            <span>
              {[
                pluralize(Object.keys(site.manifest.paths).length, "file"),
                formatBytes(site.bytes),
              ].join(" - ") + " "}
              ({site.price} MATIC)
            </span>
            <span>{formatRelative(site.timestamp, Date.now())}</span>
          </div>
        </div>
      ))}
    </>
  ) : (
    <div className="box">
      {bundlr ? (
        <>
          <BsFolder2Open size={50} />
          <h3 className="mt-4">You have not uploaded a website yet</h3>
          <Link className="btn" to="/">
            <IoCloudUploadOutline />
            New drop
          </Link>
        </>
      ) : (
        <>
          <VscLock size={50} />
          <h3 className="mt-4">Please connect your wallet first</h3>
        </>
      )}
    </div>
  );
}

export default Sites;

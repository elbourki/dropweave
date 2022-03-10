import { useContext, useState } from "react";
import { Bundlr } from "../contexts/Bundlr";
import {
  formatBytes,
  getAllFileEntries,
  pluralize,
  toUsd,
} from "../shared/helpers";
import { notyf } from "../shared/notyf";
import { Buffer } from "buffer";
import BigNumber from "bignumber.js";
import mime from "mime";
import { IoCloudUploadOutline } from "react-icons/io5";
import { VscLoading } from "react-icons/vsc";
import { GiPartyPopper } from "react-icons/gi";
import { HiOutlineExternalLink } from "react-icons/hi";

function Drop() {
  const bundlr = useContext(Bundlr);
  const [processed, setProcessed] = useState<UploadedFile[]>([]);
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [bytes, setBytes] = useState<number>(0);
  const [price, setPrice] = useState<BigNumber>();
  const [priceUsd, setPriceUsd] = useState<BigNumber>();
  const [id, setId] = useState<string>();
  const [step, setStep] = useState<
    "waiting" | "hovering" | "loading" | "confirming" | "uploading" | "done"
  >("waiting");

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (step === "waiting") setStep("hovering");
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (step === "hovering") setStep("waiting");
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setStep("waiting");
    if (!bundlr) return notyf.error("You need to connect your wallet first");
    const entries = await getAllFileEntries(e.dataTransfer.items);
    if (!entries.length) return notyf.error("Please select a valid folder");
    if (!entries.find((entry) => entry.path === "index.html"))
      return notyf.error("Your folder doesn't contain an index.html file");
    setStep("loading");
    const bytes = entries.reduce(
      (current, entry) => current + Math.max(entry.file.size, 1000),
      0
    );
    setEntries(entries);
    setBytes(bytes);
    const price = await bundlr.getPrice(
      Math.ceil((bytes + Math.max(20000, 1000 * entries.length)) * 1.1)
    );
    setPrice(price);
    setPriceUsd(await toUsd(bundlr.utils.unitConverter(price)));
    setStep("confirming");
  };

  const confirm = async () => {
    if (!bundlr || !price) return;
    setStep("loading");
    try {
      const balance = await bundlr.getLoadedBalance();
      if (price.gt(balance)) {
        await bundlr.fund(price);
        notyf.success("Successfully funded!");
      }
    } catch (e: any) {
      setStep("confirming");
      return notyf.error(e.message);
    }
    setStep("uploading");
    let processed: UploadedFile[] = [];
    for (let entry of entries) {
      try {
        const response = await bundlr.uploader.upload(
          Buffer.from(await entry.file.arrayBuffer()),
          [
            {
              name: "Content-Type",
              value:
                entry.file.type ||
                mime.getType(entry.entry.name) ||
                "application/octet-stream",
            },
            {
              name: "User-Agent",
              value: "Dropweave",
            },
          ]
        );
        processed = [
          ...processed,
          {
            id: response.data.id,
            path: entry.path,
            size: entry.file.size,
          },
        ];
        setProcessed(processed);
      } catch (e: any) {
        setStep("confirming");
        return notyf.error(e.message);
      }
    }
    setStep("loading");
    const manifest: Manifest = {
      manifest: "arweave/paths",
      version: "0.1.0",
      paths: {},
    };
    if (processed.find((file) => file.path === "index.html"))
      manifest.index = {
        path: "index.html",
      };
    manifest.paths = Object.fromEntries(
      processed.map((file) => [file.path, { id: file.id }])
    );
    try {
      const response = await bundlr.uploader.upload(
        Buffer.from(JSON.stringify(manifest), "utf-8"),
        [
          {
            name: "Content-Type",
            value: "application/x.arweave-manifest+json",
          },
          {
            name: "User-Agent",
            value: "Dropweave",
          },
        ]
      );
      setId(response.data.id);
      setStep("done");
    } catch (e: any) {
      setStep("confirming");
      return notyf.error(e.message);
    }
  };

  const uploaded = processed.reduce(
    (current, entry) => current + entry.size,
    0
  );

  if (step === "done")
    return (
      <div className="dashed-box">
        <GiPartyPopper size={50} />
        <h3 className="mt-4">
          Hooray! Your website is now permanently online.
        </h3>
        <a className="btn" href={`https://arweave.net/${id}`} target="_blank">
          <HiOutlineExternalLink />
          Open site
        </a>
      </div>
    );

  if (step === "uploading")
    return (
      <div className="dashed-box">
        We uploaded {processed.length} of {pluralize(entries.length, "file")}
        <br />
        That's {formatBytes(uploaded)} of {formatBytes(bytes)}
      </div>
    );

  if (step === "confirming")
    return price && priceUsd && bundlr ? (
      <div className="dashed-box">
        You're uploading {pluralize(entries.length, "file")} (
        {formatBytes(bytes)})
        <br />
        That would cost around {bundlr.utils
          .unitConverter(price)
          .toFixed(4, 0)}{" "}
        MATIC (~$
        {priceUsd.toFixed(2, 0)} USD)
        <button className="btn" onClick={confirm}>
          Confirm and Pay
        </button>
      </div>
    ) : (
      <></>
    );

  if (step === "loading")
    return (
      <div className="dashed-box">
        <VscLoading className="animate-spin" size={50} />
        <h3 className="mt-4">Please wait</h3>
      </div>
    );

  return (
    <div
      className={
        `dashed-box ` + (step === "hovering" ? "scale-105 animate-pulse" : "")
      }
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <IoCloudUploadOutline size={50} />
      <h3 className="mt-4">Drag and drop your site folder here</h3>
    </div>
  );
}

export default Drop;

import BigNumber from "bignumber.js";

export const truncateAddress = (address: string) => {
  const match = address.match(
    /^(0x[a-zA-Z0-9]{4})[a-zA-Z0-9]+([a-zA-Z0-9]{4})$/
  );
  if (!match) return address;
  return `${match[1]}…${match[2]}`;
};

export const toUsd = async (price: BigNumber) => {
  const response = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=matic-network&vs_currencies=usd"
  );
  const rate = (await response.json())["matic-network"]["usd"];
  return price.multipliedBy(rate);
};

export const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

export const pluralize = (count: number, noun: string, suffix = "s") =>
  `${count} ${noun}${count !== 1 ? suffix : ""}`;

export const getAllFileEntries = async (
  dataTransferItemList: DataTransferItemList
): Promise<FileEntry[]> => {
  let fileEntries: FileSystemFileEntry[] = [];
  let queue: FileSystemEntry[] = [];
  for (let i = 0; i < dataTransferItemList.length; i++) {
    const entry = dataTransferItemList[i].webkitGetAsEntry();
    if (entry) queue.push(entry);
  }
  while (queue.length > 0) {
    let entry = queue.shift() as FileSystemEntry;
    if (entry.isFile) {
      fileEntries.push(entry as FileSystemFileEntry);
    } else if (entry.isDirectory) {
      let reader = (entry as FileSystemDirectoryEntry).createReader();
      queue.push(...(await readAllDirectoryEntries(reader)));
    }
  }
  const parts = fileEntries[0].fullPath.split("/");
  const directory = parts.slice(0, parts.length > 2 ? 2 : 1).join("/") + "/";
  return Promise.all(
    fileEntries.map(async (entry) => {
      const file = await new Promise((resolve: FileCallback, reject) => {
        entry.file(resolve, reject);
      });
      return { entry, file, path: entry.fullPath.replace(directory, "") };
    })
  );
};

const readAllDirectoryEntries = async (
  directoryReader: FileSystemDirectoryReader
) => {
  let entries: FileSystemEntry[] = [];
  let readEntries = await readEntriesPromise(directoryReader);
  while (readEntries.length > 0) {
    entries.push(...readEntries);
    readEntries = await readEntriesPromise(directoryReader);
  }
  return entries;
};

const readEntriesPromise = async (
  directoryReader: FileSystemDirectoryReader
): Promise<FileSystemEntry[]> => {
  return await new Promise((resolve, reject) => {
    directoryReader.readEntries(resolve, reject);
  });
};

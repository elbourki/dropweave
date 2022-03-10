interface FileEntry {
  entry: FileSystemFileEntry;
  file: File;
  path: string;
}

interface UploadedFile {
  id: string;
  path: string;
  size: number;
}

interface Manifest {
  manifest: string;
  version: string;
  index?: {
    path: string;
  };
  paths: {
    [path: string]: {
      id: string;
    };
  };
}

interface Site {
  id: string;
  timestamp: number;
  manifest: Manifest;
  bytes: number;
  price: string;
}

interface Window {
  ethereum: any;
}

declare module "@metamask/jazzicon";

import type { DownloadToFileOptions, FileSystem } from "@aries-framework/core"

export class BrowserFileSystem implements FileSystem {
  dataPath: string
  cachePath: string
  tempPath: string

  exists(_path: string): Promise<boolean> {
    throw new Error("Method not implemented.")
  }

  createDirectory(_path: string): Promise<void> {
    throw new Error("Method not implemented.")
  }

  copyFile(_sourcePath: string, _destinationPath: string): Promise<void> {
    throw new Error("Method not implemented.")
  }
  write(_path: string, _data: string): Promise<void> {
    throw new Error("Method not implemented.")
  }
  read(_path: string): Promise<string> {
    throw new Error("Method not implemented.")
  }
  delete(_path: string): Promise<void> {
    throw new Error("Method not implemented.")
  }
  downloadToFile(
    _url: string,
    _path: string,
    _options?: DownloadToFileOptions,
  ): Promise<void> {
    throw new Error("Method not implemented.")
  }
}

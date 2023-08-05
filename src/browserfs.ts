import type { DownloadToFileOptions, FileSystem } from "@aries-framework/core"

export class BrowserFileSystem implements FileSystem {
  public dataPath: string
  public cachePath: string
  public tempPath: string

  public exists(_path: string): Promise<boolean> {
    throw new Error("Exists is not implemented.")
  }

  public createDirectory(_path: string): Promise<void> {
    throw new Error("Create directory is not implemented.")
  }

  public copyFile(
    _sourcePath: string,
    _destinationPath: string
  ): Promise<void> {
    throw new Error("Copy file is not implemented.")
  }

  public write(_path: string, _data: string): Promise<void> {
    throw new Error("Write is not implemented.")
  }
  public read(_path: string): Promise<string> {
    throw new Error("Read is not implemented.")
  }

  public delete(_path: string): Promise<void> {
    throw new Error("Delete is not implemented.")
  }

  public downloadToFile(
    _url: string,
    _path: string,
    _options?: DownloadToFileOptions
  ): Promise<void> {
    throw new Error("Download to file is not implemented.")
  }
}

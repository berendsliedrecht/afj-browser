import type { DownloadToFileOptions, FileSystem } from "@aries-framework/core"
import fs from "indexeddb-fs"
import { logger } from "."

export class BrowserFileSystem implements FileSystem {
  public dataPath: string
  public cachePath: string
  public tempPath: string

  public async exists(path: string): Promise<boolean> {
    logger.debug('called fs.exists')
    return await fs.exists(path)
  }

  public async createDirectory(path: string): Promise<void> {
    logger.debug('called fs.createDirectory')
    await fs.createDirectory(path)

    return Promise.resolve()
  }

  public async copyFile(
    sourcePath: string,
    destinationPath: string
  ): Promise<void> {
    logger.debug('called fs.copyFile')
    await fs.copyFile(sourcePath, destinationPath)

    return Promise.resolve()
  }

  public async write(path: string, data: string): Promise<void> {
    logger.debug('called fs.write')
    await fs.writeFile(path, data)
    return Promise.resolve()
  }
  public async read(path: string): Promise<string> {
    logger.debug('called fs.read')
    return await fs.readFile(path)
  }

  public async delete(path: string): Promise<void> {
    logger.debug('called fs.delete')
    return await fs.removeFile(path)
  }

  public async downloadToFile(
    url: string,
    path: string,
    _options?: DownloadToFileOptions
  ): Promise<void> {
    logger.debug('called fs.downloadToFile')
    const data = await (await fetch(url)).text()
    await this.write(path, data)
    return Promise.resolve()
  }
}

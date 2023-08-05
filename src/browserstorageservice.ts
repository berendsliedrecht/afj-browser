import {
  type AgentContext,
  type BaseRecord,
  type BaseRecordConstructor,
  type Query,
  type StorageService,
  RecordNotFoundError,
  JsonTransformer,
  RecordDuplicateError,
} from "@aries-framework/core"
import { logger } from "."

export class BrowserStorageService<T extends BaseRecord>
  implements StorageService<T>
{
  private getId(id: string, type: string) {
    return `${type}::${id}`
  }

  public async save(_: AgentContext, record: T): Promise<void> {
    logger.debug("called storage.save")
    const id = this.getId(record.id, record.type)
    if (localStorage.getItem(id)) {
      throw new RecordDuplicateError(
        `Record with id ${record.id} already exists`,
        { recordType: record.type }
      )
    }
    localStorage.setItem(id, JSON.stringify(record.toJSON()))
    return Promise.resolve()
  }

  public update(_agentContext: AgentContext, record: T): Promise<void> {
    logger.debug("called storage.update")
    record.updatedAt = new Date()
    const id = this.getId(record.id, record.type)
    if (!localStorage.getItem(id)) {
      throw new RecordNotFoundError(
        `Record with id ${record.id} does not exist`,
        { recordType: record.type }
      )
    }
    localStorage.setItem(id, JSON.stringify(record.toJSON()))
    return Promise.resolve()
  }

  public delete(_agentContext: AgentContext, record: T): Promise<void> {
    logger.debug("called storage.delete")
    localStorage.removeItem(record.id)
    return Promise.resolve()
  }

  public deleteById(
    _agentContext: AgentContext,
    recordClass: BaseRecordConstructor<T>,
    id: string
  ): Promise<void> {
    logger.debug("called storage.deleteById")
    const newId = this.getId(id, recordClass.type)
    localStorage.removeItem(newId)
    return Promise.resolve()
  }

  public async getById(
    _agentContext: AgentContext,
    recordClass: BaseRecordConstructor<T>,
    id: string
  ): Promise<T> {
    logger.debug(
      `called storage.getById: id - ${id} class - ${recordClass.type}`
    )
    const newId = this.getId(id, recordClass.type)
    const item = localStorage.getItem(newId)
    if (item) {
      return Promise.resolve(JsonTransformer.deserialize<T>(item, recordClass))
    } else {
      throw new RecordNotFoundError(
        `Record ${recordClass.type} with id ${id} does not exist`,
        { recordType: recordClass.type }
      )
    }
  }

  public async getAll(
    agentContext: AgentContext,
    recordClass: BaseRecordConstructor<T>
  ): Promise<T[]> {
    logger.debug("called storage.getAll")
    const items = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key.startsWith(recordClass.type)) {
        const item = await this.getById(
          agentContext,
          recordClass,
          key.split("::")[1]
        )
        items.push(item)
      }
    }
    return items
  }

  public async findByQuery(
    agentContext: AgentContext,
    recordClass: BaseRecordConstructor<T>,
    query: Query<T>
  ): Promise<T[]> {
    logger.debug(
      `called storage.findByQuery: ${recordClass.name} - ${JSON.stringify(
        query
      )}`
    )

    const records = await this.getAll(agentContext, recordClass)

    const queryItems = Object.entries(query)
    const filteredRecords = records.filter((r) =>
      queryItems.some(
        ([key, value]) => (r as Record<string, unknown>)[key] === value
      )
    )

    return filteredRecords
  }
}

import type {
  AgentContext,
  BaseRecord,
  BaseRecordConstructor,
  Query,
  StorageService,
} from "@aries-framework/core"

export class BrowserStorageService<T extends BaseRecord>
  implements StorageService<T>
{
  public save(_: AgentContext, record: T): Promise<void> {
    localStorage.setItem(record.id, JSON.stringify(record))
    return Promise.resolve()
  }

  public update(_agentContext: AgentContext, record: T): Promise<void> {
    localStorage.setItem(record.id, JSON.stringify(record))
    return Promise.resolve()
  }

  public delete(_agentContext: AgentContext, record: T): Promise<void> {
    localStorage.removeItem(record.id)
    return Promise.resolve()
  }

  public deleteById(
    _agentContext: AgentContext,
    _recordClass: BaseRecordConstructor<T>,
    id: string
  ): Promise<void> {
    // TODO: check if item in storage is instance of `recordClass`
    localStorage.removeItem(id)
    return Promise.resolve()
  }

  public getById(
    _agentContext: AgentContext,
    _recordClass: BaseRecordConstructor<T>,
    id: string
  ): Promise<T> {
    return JSON.parse(localStorage.getItem(id))
  }

  public async getAll(
    agentContext: AgentContext,
    recordClass: BaseRecordConstructor<T>
  ): Promise<T[]> {
    const items = []
    for (let i = 0; i <= localStorage.length; i++) {
      const key = localStorage.key(i)
      // TODO: check whether the item is of instance `recordClass`
      items.push(await this.getById(agentContext, recordClass, key))
    }
    return items
  }

  public async findByQuery(
    agentContext: AgentContext,
    recordClass: BaseRecordConstructor<T>,
    _query: Query<T>
  ): Promise<T[]> {
    return [
      await this.getById(agentContext, recordClass, "MEDIATOR_ROUTING_RECORD"),
    ]
  }
}

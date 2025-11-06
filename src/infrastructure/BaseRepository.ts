export abstract class BaseRepository<TDomain, TPersistence> {
  /**
   * Concrete repositories must provide the object store name.
   */
  protected abstract readonly STORE_NAME: string

  /**
   * Convert a persistence/plain object to a domain entity.
   */
  protected abstract toDomain(raw: TPersistence): TDomain

  /**
   * Convert a domain entity to a persistence-friendly plain object.
   */
  protected abstract toPersistence(entity: TDomain): TPersistence
}

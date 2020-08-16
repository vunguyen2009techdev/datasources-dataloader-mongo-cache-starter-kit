import { DataSource } from 'apollo-datasource';
import { ApolloError } from 'apollo-server';
import { InMemoryLRUCache } from 'apollo-server-caching';
import { createCachingMethods } from './cache';
import { isCollectionOrModel } from './helpers';

class MongoDataSource extends DataSource {
  constructor(collection) {
    super();

    if (!isCollectionOrModel) {
      throw new ApolloError(`MongoDataSource constructor must be given an object with a single collection`);
    }

    this.collection = collection;
  }

  initialize({ context, cache, debug, allowFlushingCollectionCache } = {}) {
    this.context = context;

    const cached = cache || new InMemoryLRUCache();

    const methods = createCachingMethods({
      collection: this.collection,
      cache: cached,
      debug,
      allowFlushingCollectionCache
    });

    Object.assign(this, methods);
  }
}

export { MongoDataSource };

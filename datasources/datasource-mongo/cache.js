import DataLoader from "dataloader";
import sift from "sift";
import {getCollection} from './helpers';

const handleCache = async({ ttl, doc, key, cache }) => {
  if (Number.isInteger(ttl)) {
    cache.set(key, JSON.stringify(doc), { ttl });
  }
}

const orderDocs = (ids) => (docs) => {
  const idMap = {};
  docs.map(doc => {
    idMap[doc._id] = doc;
  });

  return ids.map(id => idMap[id]);
};

export const createCachingMethods = ({
  collection,
  cache,
  debug = false,
  allowFlushingCollectionCache = false,
}) => {
  const isRedis = typeof cache.store === "undefined";
  const isMongoose = typeof collection === "function";

  const loader = new DataLoader((ids) => {
    return isMongoose
      ? collection
          .find({ _id: { $in: ids } })
          .lean()
          .then(orderDocs(ids))
      : collection.find({ _id: { $in: ids }}).toArray().then(orderDocs(ids));
  });

  const dataQuery = isMongoose ? ({ queries }) => {
    return collection.find({ $or: queries }).lean().then(items => {
      return queries.map(query => {
        return items.filter(sift(query));
      });
    })
  } : ({ queries }) => {
    collection.find({ $or: queries }).toArray().then(items => {
      return queries.map(query => {
        return items.filter(sift(query));
      });
    });
  };

  const queryLoader = new DataLoader(queries => dataQuery({ queries }));

  const cachePrefix = `mongo:${getCollection(collection).collectionName}:`;

  const methods = {
    findOneById: async (id = null, { ttl = null } = {}) => {
      const key = `${cachePrefix}${id}`;

      const cacheDoc = await cache.get(key);

      if (debug) {
        console.log("KEY", key, cacheDoc ? 'cache': 'miss');
      }

      if (cacheDoc) {
        return JSON.parse(cacheDoc);
      }

      const doc = await loader.load(id);

      await handleCache({
        ttl,
        doc,
        key,
        cache,
      });

      return doc;
    },

    findManyByIds: (ids, { ttl } = {}) => {
      return Promise.all(ids.map(id => methods.findOneById(id, { ttl })));
    },

    findManyByQuery: async (query, { ttl } = {}) => {
      const key = cachePrefix + JSON.stringify(query);
      const cacheDocs = await cache.get(key);

      if (debug) {
        console.log("KEY", key, cacheDocs ? 'cache': 'miss');
      }

      if (cacheDocs) {
        return JSON.parse(cacheDocs)
      }

      const docs = await queryLoader.load(query);
      
      await handleCache({
        ttl,
        doc: docs,
        key,
        cache,
      });
      return docs;
    },

    deleteFromCachebyId: async (id) => {
      console.log("id to delete: ", id);
      const key = id && typeof id === 'object' ? JSON.stringify(id) : id;
      await cache.delete(`${cachePrefix}${key}`);
    }
  };
  return methods;
};

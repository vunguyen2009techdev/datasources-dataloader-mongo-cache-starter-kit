import { MongoDataSource } from '../../datasource-mongo';
import {removeEmpty} from '../../../utils';

export default class Project extends MongoDataSource {
  initialize(config) {
    super.initialize({
      ...config,
      debug: true
    });
  }

  async update({ id, name, description}) {
    const objUpdate = removeEmpty({ name, description });
    if (!objUpdate) return null;

    await this.collection.updateOne({_id: id }, objUpdate);
    await this.deleteFromCachebyId(id);
    const result = await this.loadOneById(id, { ttl: 120 });
    return result;
  }

  async loadOneById(id, { ttl = null } = {}) {
    return this.findOneById(id, { ttl });
  }
}

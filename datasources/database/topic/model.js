
import { MongoDataSource } from '../../datasource-mongo';

export default class Project extends MongoDataSource {
  initialize(config) {
    super.initialize({
      ...config,
      debug: true
    });
  }
}

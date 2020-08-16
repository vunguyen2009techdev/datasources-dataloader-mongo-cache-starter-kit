import TopicAPI from './model';
import TopicSchema from './schema';

export default (db) => new TopicAPI(db.model("Topic", TopicSchema));

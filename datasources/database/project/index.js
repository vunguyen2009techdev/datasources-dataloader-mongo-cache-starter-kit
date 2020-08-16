import ProjectAPI from './model';
import ProjectSchema from './schema';

export default (db) => new ProjectAPI(db.model("Project", ProjectSchema));

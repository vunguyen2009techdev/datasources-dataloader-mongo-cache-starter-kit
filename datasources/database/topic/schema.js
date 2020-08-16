import mongoose from 'mongoose';

export default mongoose.Schema({
  name: String,
  query: String,
  projectIds: [String]
});
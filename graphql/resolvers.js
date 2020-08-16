export const resolvers = {
  Query: {
    project: (_, { id }, { dataSources: { Project } }) => {
      return Project.loadOneById(id, {ttl: 120});
    },
    projectByIds: (_, {ids}, { dataSources: { Project } }) => {
      return Project.findManyByIds(ids, { ttl:120 });
    }
  },
  Mutation: {
    updateProject: (_, { id, name, description }, { dataSources: { Project } }) => {
      return Project.update({ id, name, description });
    }
  },
  Project: {
    topics: async (root, __, { dataSources: { Topic } }) => {
      // return Topic.findManyByIds(root.topicIds, {ttl: 120});
      let getTopics = await Topic.findManyByQuery({ projectIds: root._id }, { ttl: 120 });
      getTopics.map(p => {
        p.projectIds = p.projectIds.filter(item => item == root._id);
        return p;
      });
      return getTopics;
    }
  },
  Topic: {
    projects: (root, __, { dataSources: { Project }}) => {
      // return Project.findManyByQuery({topicIds: root._id}, { ttl : 120 });
      return Project.findManyByIds(root.projectIds, { ttl: 120 });
    }
  }
};

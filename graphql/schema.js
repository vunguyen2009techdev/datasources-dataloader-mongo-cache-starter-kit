import {gql} from 'apollo-server';

export const typeDefs = gql`
  type Query {
    _: Boolean
    project(id: String): Project
    projectByIds(ids: [String]): [Project]
  }

  type Mutation {
    _: Boolean
    updateProject(id: ID, name: String, description: String): Project
  }

  type Project {
    _id: ID
    name: String
    description: String
    # topics(topicIds: [String]): [Topic]
    topics: [Topic]
  }

  type Topic {
    _id: ID
    name: String
    query: String
    # projects: [Project]
    projects(projectIds: [String!]): [Project]
  }
`;


import { gql } from "apollo-server-express";

const typeDefs = gql`
  scalar Date

  type Query {
    projects: [Project!]! @cacheControl(scope: PRIVATE)
    tasks(project_id: Int!): [Task!]!
    entries(start_date: String!, end_date: String!): [Entry!]!
    entry(date: String!): [Entry!]!
  }

  type Mutation {
    authen(username: String!, password: String!): Role
    createEntry(
      date: String!
      task_id: Int!
      hours: Float!
      notes: String
    ): Entry!
    updateEntry(id: Int!, hours: Float!, notes: String): Entry!
    deleteEntry(id: Int!): Boolean!
  }

  type Role {
    subscription_id: Int!
    company: String!
    api_token: String!
  }

  type Project {
    id: Int!
    name: String!
    client_id: Int!
    owner_id: Int!
    url: String!
    tasks: [Task!]!
  }

  type Task {
    id: Int!
    name: String!
    position: Int!
    project_id: Int!
    url: String!
  }

  type Entry {
    id: Int!
    date: String!
    hours: Int!
    notes: String
    task_id: Int!
    user_id: Int!
    url: String!
  }
`;

export default typeDefs;

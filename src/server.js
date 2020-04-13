const { GraphQLServer } = require('graphql-yoga');

const Server = new GraphQLServer({
  typeDefs,
  resolvers,
});

Server.start();
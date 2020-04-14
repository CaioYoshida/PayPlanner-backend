const { GraphQLServer } = require('graphql-yoga');
const path = require('path');
const resolvers = require('./resolvers');

const Server = new GraphQLServer({
  typeDefs: path.resolve(__dirname, 'schema.graphql'),
  resolvers,
});

Server.start(() => console.log('Server running on port 4000'));
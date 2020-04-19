const { GraphQLServer } = require('graphql-yoga');
const path = require('path');
const resolvers = require('./resolvers');
const jwt = require('jsonwebtoken');

const { secret } = require('./config/authConfig');

/*const printOk = async (resolve, root, args, context, info) => {
  const token = await jwt.verify(``, secret);
  //const token = null;

  if (token) {
    context.user_id = token.claims.id;
  } else {
    context.user_id = "";
  }

  context.token = 'token';
  const result = await resolve(root, args, context, info);

  return result;
}*/

const autheticate = async (resolve, root, args, context, info) => {
  let token;
  try {
    token = jwt.verify(context.request.headers.authorization, secret);   
  } catch (e) {
    return new Error("Not authorized");
  }

  context.token = token;
  context.user_id = token.claims.id;
  const result = await resolve(root, args, context, info);
  return result;
};

const Server = new GraphQLServer({
  typeDefs: path.resolve(__dirname, 'schema.graphql'),
  resolvers,
  context: req => ({ ...req }),
  middlewares: [autheticate]
});

Server.start(() => console.log('Server running on port 4000'));
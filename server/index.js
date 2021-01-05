const { ApolloServer } = require('apollo-server');
const bcrypt = require("bcrypt");

const typeDefs = require("./typeDefs");
const resolvers = require("./resolvers");
const db = require("./db");

const validate = auth => {
    const decodedAuth = Buffer.from(auth, 'base64').toString('utf-8');
    const [username, password] = decodedAuth.split(":");
    const user = db.get("users").find({ username }).value();
    if (user !== undefined && user !== null) {
        if (bcrypt.compareSync(password, user.password)) {
            return user._id;
        }
    }
    return null;
}

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
        const context = {};
        if (req.headers.authorization) {
            context.userId = validate(req.headers.authorization);
        }
        return context;
    }
});

server.listen().then(({ url }) => {
    console.log(`Server is running at ${url}`);
});
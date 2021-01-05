const shortid = require('shortid');
const db = require('./db');

const resolvers = {
    Status: {
        user: (status, args, context) => {
            if (!context.userId) {
                return null;
            }
            return db.get('users')
                .find({ _id: status.userId })
                .value();
        },
        isLiked: (status, args, context) => {
            if (!context.userId) {
                return null;
            }
            const currentLikes = db.get(`likes.${context.userId}`, {}).value();
            return currentLikes[status._id] || false;
        }
    },
    Query: {
        example: () => ({ _id: '1', text: 'this is an example' }),
        feed: (parent, args, context) => {
            if (!context.userId) {
                return null;
            }
            return db.get('feed')
                .filter(o => o.parentStatusId === null || o.parentStatusId === undefined)
                .orderBy('publishedAt', 'desc')
                .value();
        },
        responses: (parent, args, context) => {
            if (!context.userId) {
                return null;
            }
            const originalStatus = db.get('feed')
                .find({ _id: args._id })
                .value();
            const responses = db.get('feed')
                .filter({ parentStatusId: args._id })
                .orderBy('publishedAt', 'desc')
                .value();
            return [originalStatus, ...responses];
        }
    },
    Mutation: {
        createStatus: (parent, args, context) => {
            if (!context.userId) {
                return null;
            }
            const _id = shortid.generate();
            const newStatus = {
                _id,
                userId: context.userId,
                status: args.status.text,
                publishedAt: new Date().toISOString(),
                parentStatusId: args.status.parentStatusId
            };
            db.get('feed').push(newStatus).write();
            return db.get('feed').find({ _id }).value();
        },
        likeStatus: (parent, args, context) => {
            if (!context.userId) {
                return null;
            }
            const key = `likes.${context.userId}`;
            const currentLikes = db.get(key, {}).value();
            const currentLikeStatus = currentLikes[args.statusId] || false;
            db.set(key, {
                ...currentLikes,
                [args.statusId]: !currentLikeStatus
            }).write();
            return db.get('feed').find({ _id: args.statusId }).value();
        },
    },
};

module.exports = resolvers;
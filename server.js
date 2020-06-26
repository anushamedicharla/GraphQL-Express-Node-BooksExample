const express = require('express');
const expressGraphQL = require('express-graphql');
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLNonNull
} =  require('graphql');

const BookType = new GraphQLObjectType({
    name: 'Book',
    description: 'This represents a book written by an author',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt)},
        name: { type: GraphQLNonNull(GraphQLString)},
        authorId: { type: GraphQLNonNull(GraphQLInt)},
        author: { 
            type: AuthorType,
            resolve: (book) => {
                // This resolve takes a parent property as an argument which in this case is a book.
                // We have to use resolve here because 'author' is not a part of the original book data.
                return authors.find(author => author.id === book.authorId)
            }
        }
    })
})

const AuthorType = new GraphQLObjectType({
    name: 'Author',
    description: 'This represents an author of a book',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt)},
        name: { type: GraphQLNonNull(GraphQLString)},
        books: {
            type: BookType,
            resolve: (author) => {
                // This resolve takes a parent property as an argument which in this case is a author.
                // We have to use resolve here because 'author' is not a part of the original book data.
                return books.find(book => book.authorId === author.id)
            }
        }
    })
})

const authors = [
    { id: 1, name: 'J. K. Rowling'},
    { id: 2, name: 'J. R. R. Tolkien'},
    { id: 3, name: 'Brent Weeks'},
];

const books = [
    { id: 1, name: 'Harry Potter and the Soceror\'s Stone ', authorId: 1},
    { id: 2, name: 'Harry Potter and the Chamber of Secrets', authorId: 1},
    { id: 3, name: 'Harry Potter and the Prisoner of Azkaban', authorId: 1},
    { id: 4, name: 'Harry Potter and the Goblet of Fire', authorId: 1},
    { id: 5, name: 'The Fellowship of the Ring', authorId: 2},
    { id: 6, name: 'The Tqo Towers', authorId: 2},
    { id: 7, name: 'The way of Shadows', authorId: 3},
    { id: 8, name: 'Beyond the Shadows', authorId: 3},
];

const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({ // Fields need to return a callback method instead of passing an object directly because everything ( like resolve of BookType and AuthorType ) need to be defined before they can be returned.
        book: {
            type: BookType,
            description: 'a single book.',
            args: { // The type of arguments that could be passed from the graphql query
                id: { type: GraphQLInt }
            },
            resolve: (paarent, args) => books.find(book => book.id === args.id) // args here will contain the arguments passed from the graphql query
        },
        books: {
            type: new GraphQLList(BookType),
            description: 'a list of books.',
            resolve: () => books
        },
        author: {
            type: AuthorType,
            description: 'a single author.',
            args: { // The type of arguments that could be passed from the graphql query
                id: { type: GraphQLInt }
            },
            resolve: (paarent, args) => authors.find(author => author.id === args.id)
        },
        authors: {
            type: new GraphQLList(AuthorType),
            description: 'a list of authors.',
            resolve: () => authors
        }
    })
});

const RootMutationType =  new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root Mutation',
    fields: () => ({
        addBook: {
            type: BookType,
            description: 'Add a book',
            args: { // args would be the data we pass to add this new book
                name: { type: GraphQLNonNull(GraphQLString)},
                authorId: { type: GraphQLNonNull(GraphQLInt)},
            },
            resolve: (parent, args) => {
                const book = { id: books.length + 1, name: args.name, authorId: args.authorId }
                books.push(book);
                return book;
            
            }
        },
        addAuthor: {
            type: AuthorType,
            description: 'Add an author',
            args: { // args would be the data we pass to add this new book
                name: { type: GraphQLNonNull(GraphQLString)}
            },
            resolve: (parent, args) => {
                const author = { id: authors.length + 1, name: args.name}
                authors.push(author);
                return author;
            
            }
        }
    })
})

const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
})

const app = express();
app.use('/graphql', expressGraphQL({
    schema: schema,
    graphiql: true
}));
app.listen(5000., () => console.log('Server Running'));
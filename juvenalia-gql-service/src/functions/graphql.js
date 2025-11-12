const { app } = require('@azure/functions');
const { ApolloServer } = require('@apollo/server');
const { v4 } = require('@as-integrations/azure-functions');

const events = require('../../events.json');

// The GraphQL schema
const typeDefs = `#graphql
  type Query {
    events(type: String): [Event]!
    event(id: ID!): Event
  }

  type Mutation {
    addEvent(input: AddEventInput!): Event!
  }

  type Event {
  id: ID!
  name: String!
  description: String!
  type: String!
  date: String!
 # eventUrl: String!
 # location: Location!
 # artists: [Artist]!
 # tickets: [Ticket]!
 # ticketsUrl: String!
 # tags: [String]!
 # organizer: Organizer!
 # registrationRequired: Boolean!
 # accessibility: Accessibility!
}

type Location {
  id: ID!
  name: String!
  address: Address!
  googleMapsPin: String!
  nearestPublicTransportStop: PublicTransportStop!
}

type Address {
  street: String!
  number: String!
  postCode: String!
  city: String!
}

type PublicTransportStop {
  name: String!
  lines: TransportLines!
}

type TransportLines {
  buses: [String]!
  trams: [String]!
}

type Artist {
  id: ID!
  name: String!
  genre: String!
  socialMedia: SocialMedia!
}

type SocialMedia {
  facebook: String
  instagram: String
}

type Ticket {
  name: String!
  price: Price!
}

type Price {
  amount: Float!
  currency: String!
}

type Organizer {
  name: String!
  contactEmail: String!
  contactPhone: String!
}

type Accessibility {
  wheelchairAccessible: Boolean!
  signLanguage: Boolean!
}

input AddEventInput {
  name: String!
  description: String!
  type: String!
  date: String!
}
`;

// A map of functions which return data for the schema.
const resolvers = {
    Query: {
        events: (_parent, args, _contextValue, _info) => {
            if (args.type) {
                return events.filter(event => event.type === args.type);
            }
            return events;
        },
        event: (_parent, args, _contextValue, _info) => {
            return events.find(event => event.id === args.id);
        }
    },
    Mutation: {
        addEvent: (_parent, args, _contextValue, _info) => {
            const input = args.input;
            const newEvent = {
                id: (events.length + 1).toString(),
                name: input.name,
                description: input.description,
                type: input.type,
                date: input.date
            }
            console.log(newEvent);
            events.push(newEvent);
            return newEvent;
        }
    }
};

// Set up Apollo Server
const server = new ApolloServer({
    typeDefs,
    resolvers,
});

app.http('graphql', {
    handler: v4.startServerAndCreateHandler(server),
});
export const typeDefs: string = `#graphql
  type Person {
    uid: String
    name: String
    birthcountry: String
    birthdate: Date
    birthplace: String
    death_country: String
    death_date: Date
    death_place: String
    sources: [String]!

    familyIn: [Person!]! @relationship (type: "Family", direction: IN, properties: "Family", queryDirection: DEFAULT_DIRECTED)
    familyOut: [Person!]! @relationship (type: "Family", direction: OUT, properties: "Family", queryDirection: DEFAULT_DIRECTED)

    acquaintances: [Person!]! @relationship (type: "Relation", direction: OUT, properties: "Relation", queryDirection: DEFAULT_UNDIRECTED)
    politicalOffices: [Position!]! @relationship (type: "Politics", direction: OUT, properties: "Politics", queryDirection: DEFAULT_UNDIRECTED)
    partyMemberships: [Party!]! @relationship (type: "Politics", direction: OUT, properties: "Politics", queryDirection: DEFAULT_UNDIRECTED)
    businessInterests: [Company!]! @relationship (type: "BusinessInterest", direction: OUT, properties: "BusinessInterest", queryDirection: DEFAULT_UNDIRECTED)
    properties: [Property!]! @relationship (type: "BusinessInterest", direction: OUT, properties: "BusinessInterest", queryDirection: DEFAULT_UNDIRECTED)

    familyGroups: [Group!]! @relationship (type: "Family", direction: OUT, properties: "Family", queryDirection: DEFAULT_UNDIRECTED)
    groups: [Group!]! @relationship (type: "Relation", direction: OUT, properties: "Relation", queryDirection: DEFAULT_UNDIRECTED)
  }

  interface Family {
    type: String
    source: String
    from: Date
    to: Date
  }

  interface Relation {
    type: String
    notes: String
    source: String
  }

  interface Politics {
    source: String
    from: Date
    to: Date
  }

  interface BusinessInterest {
    source: String
    type: String
    from: Date
    to: Date
  }

  type Group {
    name: String
    type: String
    source: String
  }

  type Party {
    name: String
    note: String
    country: String
    from: Date
    to: Date
    source: String
  }

  type Company {
    name: String
    founded: Date
    source: String
    address: String
  }

  type Property {
    name: String
    location: String
    address: String
  }

  type Government {
    name: String
    from: Date
    short_code: String
  }

  type Position {
    name: String
  }
`

export const resolvers: any[] = []
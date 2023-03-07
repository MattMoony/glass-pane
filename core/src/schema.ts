export const typeDefs: string = `#graphql
  type Person {
    uid: String
    name: String
    birthcountry: String
    birthdate: Date
    birthplace: String
    source: String
    death_country: String
    death_date: Date
    death_place: String
    link1: String
    link2: String
    link3: String
    link4: String

    familyMembers: [Person!]! @relationship (type: "Family", direction: OUT, queryDirection: DEFAULT_UNDIRECTED)
    acquaintances: [Person!]! @relationship (type: "Relation", direction: OUT, queryDirection: DEFAULT_UNDIRECTED)
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
`

export const resolvers: any[] = []
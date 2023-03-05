import * as neo4j from './neo4j'
import express from 'express'
import http from 'http'
import * as config from './config'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import cors from 'cors'
import bodyParser from 'body-parser'
import { typeDefs, resolvers } from './schema'
import { Neo4jGraphQL } from '@neo4j/graphql'

async function main (): Promise<void> {
  await neo4j.connect()

  const app: express.Application = express()
  const httpServer: http.Server = http.createServer(app)

  if (config.NODE_ENV === 'production') {
    // do some production stuff perhaps
  }

  const neoSchema: Neo4jGraphQL = new Neo4jGraphQL({
    typeDefs,
    resolvers,
    driver: neo4j.driver,
  })

  const server: ApolloServer = new ApolloServer({
    schema: await neoSchema.getSchema(),
    plugins: [ ApolloServerPluginDrainHttpServer({ httpServer, }) ]
  })

  await server.start()

  app.use(
    '/graphql',
    cors<cors.CorsRequest>(),
    bodyParser.json(),
    expressMiddleware(server)
  )
  
  await new Promise<void>(resolve => httpServer.listen({ 
    host: config.HTTP_HOST, 
    port: config.HTTP_PORT, 
  }, resolve))
  console.log(`[core] 🚀 Listening on http://${config.HTTP_HOST}:${config.HTTP_PORT}`)
}

main()
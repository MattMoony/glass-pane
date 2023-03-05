import * as neo4j from 'neo4j-driver'
import * as config from './config'

export const driver: neo4j.Driver = neo4j.driver(config.NEO_URL, neo4j.auth.basic(config.NEO_USER, config.NEO_PASS))

export async function connect (): Promise<void> {
  await driver.verifyConnectivity()
}

export function close (): Promise<void> {
  return driver.close()
}
#!/usr/bin/env python3

import neo4j
import funcs
from neo4j import GraphDatabase
from dotenv import dotenv_values
from argparse import ArgumentParser
from typing import Dict, Any, List

config: Dict[str, Any] = dotenv_values('../core/.env')

def write_sources(tx: neo4j.ManagedTransaction, uid: str, sources: List[str] = []) -> List[str]:
    return tx.run('MATCH (p:Person{uid: $uid}) SET p.sources = $sources RETURN p.sources as sources', uid=uid, sources=sources).single()['sources']

def remove_old(tx: neo4j.ManagedTransaction, uid: str, num_links: int) -> None:
    # nasty code, but...
    return tx.run('MATCH (p:Person{uid: $uid}) REMOVE p.source, ' + ', '.join('p.link' + str(i) for i in range(num_links)) + ' RETURN p.uid AS uid', uid=uid).single()['uid']

def main() -> None:
    parser = ArgumentParser()
    parser.add_argument('--force', action='store_true')
    parser.add_argument('--num-links', type=int, default=20)
    parser.add_argument('--remove', action='store_true', help='Remove old source stuff?')
    args = parser.parse_args()

    driver: GraphDatabase = GraphDatabase.driver(config['NEO_URL'], auth=(config['NEO_USER'], config['NEO_PASS'],))
    print(f'[*] Transforming "source" and "link*" elements into "sources" array ... ')

    with driver.session(database='neo4j') as sess:
        records = sess.execute_read(funcs.get_people)
    with driver.session(database='neo4j') as sess:
        for r in records:
            r = r.value()
            if r['sources'] is None or args.force:
                print(f'[*] Re-structuring sources for {r["uid"]} ({r["name"]}) ... ')
                sess.execute_write(write_sources, r['uid'], [ r[f'link{i}'] for i in range(args.num_links) if r[f'link{i}'] is not None ] +\
                        [ r['source'], ] if r['source'] is not None else [])
                if args.remove:
                    sess.execute_write(remove_old, r['uid'], args.num_links)

if __name__ == '__main__':
    main()

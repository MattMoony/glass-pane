#!/usr/bin/env python3

import uuid
import neo4j
from neo4j import GraphDatabase
from dotenv import dotenv_values
from argparse import ArgumentParser
from typing import Dict, Any, List, Tuple

config: Dict[str, Any] = dotenv_values('../core/.env')

def get_people(tx: neo4j.ManagedTransaction) -> List[neo4j.Record]:
    res = tx.run('MATCH (p:Person) RETURN p.name as name, p.birthdate as birthdate, p.uid as uid')
    return list(res)

def uid_unique(tx: neo4j.ManagedTransaction, uid: str) -> List[neo4j.Record]:
    res = tx.run('MATCH (p:Person{ uid: $uid }) RETURN p', uid=uid)
    return list(res)

def assign_unique_uid(tx: neo4j.ManagedTransaction, sess: neo4j.Session, name: str, birthdate: Any, uid: str) -> str:
    if birthdate:
        res = tx.run('MATCH (p:Person{ name: $name, birthdate: $birthdate}) SET p.uid = $uid RETURN p.uid as uid', name=name, birthdate=birthdate, uid=uid)
    else:
        res = tx.run('MATCH (p:Person{ name: $name }) SET p.uid = $uid RETURN p.uid as uid', name=name, uid=uid)
    return res.single()['uid']

def count_unique_people(tx: neo4j.ManagedTransaction) -> int:
    return tx.run('MATCH (p:Person) RETURN COUNT(DISTINCT p) as count').single()['count']

def count_unique_uids(tx: neo4j.ManagedTransaction) -> int:
    return tx.run('MATCH (p:Person) RETURN COUNT(DISTINCT p.uid) as count').single()['count']

def main() -> None:
    parser = ArgumentParser()
    parser.add_argument('--overwrite', action='store_true')
    args = parser.parse_args()

    driver: GraphDatabase = GraphDatabase.driver(config['NEO_URL'], auth=(config['NEO_USER'], config['NEO_PASS']))
    print(f'[*] {"Adding" if not args.overwrite else "Re-generating"} unique ids for people ... ')

    with driver.session(database='neo4j') as sess:
        records = sess.execute_read(get_people)
    for r in records:
        if r['uid'] and not args.overwrite:
            continue
        with driver.session(database='neo4j') as sess:
            records = True
            while records:
                uid: str = uuid.uuid4().hex
                records = sess.execute_read(uid_unique, uid)
        with driver.session(database='neo4j') as sess:
            uid = sess.execute_write(assign_unique_uid, sess, r['name'], r['birthdate'], uid)
            print(f'[*] {uid} => {r["name"]}')
    with driver.session(database='neo4j') as sess:
        print(f'[+] {sess.execute_read(count_unique_people)} unique people / {sess.execute_read(count_unique_uids)} unique uids ... ')
    driver.close()

if __name__ == '__main__':
    main()

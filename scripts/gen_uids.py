#!/usr/bin/env python3

import uuid
from neo4j import GraphDatabase
from dotenv import dotenv_values
from typing import Dict, Any, List, Tuple
from IPython import embed

config: Dict[str, Any] = dotenv_values('../core/.env')

def get_people(tx) -> Tuple[List[Any], Any]:
    res = tx.run('MATCH (p:Person) RETURN p.name as name, p.birthdate as birthdate')
    return list(res), res.consume()

def uid_unique(tx, uid: str):
    res = tx.run('MATCH (p:Person{ uid: $uid }) RETURN p', uid=uid)
    return list(res), res.consume()

def assign_unique_uid(tx, sess, name: str, birthdate: Any, uid: str):
    if birthdate:
        res = tx.run('MATCH (p:Person{ name: $name, birthdate: $birthdate}) SET p.uid = $uid RETURN p.uid as uid', name=name, birthdate=birthdate, uid=uid)
    else:
        res = tx.run('MATCH (p:Person{ name: $name }) SET p.uid = $uid RETURN p.uid as uid', name=name, uid=uid)
    return res.single()['uid']

def main():
    driver: GraphDatabase = GraphDatabase.driver(config['NEO_URL'], auth=(config['NEO_USER'], config['NEO_PASS']))
    with driver.session(database='neo4j') as sess:
        records, summary = sess.execute_read(get_people)
    for r in records:
        with driver.session(database='neo4j') as sess:
            records = True
            while records:
                uid: str = uuid.uuid4().hex
                records, _ = sess.execute_read(uid_unique, uid)
        with driver.session(database='neo4j') as sess:
            uid = sess.execute_write(assign_unique_uid, sess, r['name'], r['birthdate'], uid)
            print(uid, r['name'])
    driver.close()

if __name__ == '__main__':
    main()

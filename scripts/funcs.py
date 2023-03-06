#!/usr/bin/env python3

import neo4j
from typing import List

def get_people(tx: neo4j.ManagedTransaction) -> List[neo4j.Record]:
    """
    Get all people in the DB.
    """
    res = tx.run('MATCH (p:Person) RETURN p')
    return list(res)


#!/usr/bin/env python3

import os
import csv
import psycopg2
from typing import Dict, List

CORE: str = os.path.realpath(os.path.join(os.path.dirname(__file__), '..', '..', 'core'))
DATA: str = os.path.realpath(os.path.join(os.path.dirname(__file__), '..', 'data'))

def main():
    print(f'''[+] NOTION 2 GLASS-PANE
[!] Very simple script to insert data from a Notion CSV export into the postgres db.
[!] Please NOTE that this very simple script doesn't protect against SQLi ... 
[*] Using path "{CORE}" as the core directory.
[*] Using path "{DATA}" as the data directory.''')
    
    with open(os.path.join(CORE, '.env'), 'r', encoding='utf-8') as f:
        for line in f:
            if line.startswith('PGUSER='):
                user: str = line.split('=')[1].strip()
            elif line.startswith('PGPASSWORD='):
                password: str = line.split('=')[1].strip()
            elif line.startswith('PGDATABASE='):
                db: str = line.split('=')[1].strip()
            elif line.startswith('PGHOST='):
                host: str = line.split('=')[1].strip()
            elif line.startswith('PGPORT='):
                port: str = line.split('=')[1].strip()

    print('[*] Connecting to the database ... ')
    connection = psycopg2.connect(user=user, password=password, dbname=db, host=host, port=port)

    organizations: Dict[str, Dict[str, List[str]]] = dict()

    print(f'[*] Importing organizations ... ')
    with open(os.path.join(DATA, 'organizations', 'organizations.csv'), 'r', encoding='utf-8') as f:
        cr: csv.reader = csv.reader(f)
        cols: List[str] = next(cr)
        print(f'[*] Columns: {cols}')
        for row in cr:
            cursor = connection.cursor()
            _, name, otype, stype, loc, parent, members, children, assoc = row
            members = [ m.split('(https:')[0].strip() for m in members.split(', ') ]
            children = [ c.split('(https:')[0].strip() for c in children.split(', ')]
            assoc = [ a.split('(https:')[0].strip() for a in assoc.split(', ') ]
            organizations[name] = { 'members': members, 'children': children, 'assoc': assoc, }
            cursor.execute('''
INSERT INTO       organ
DEFAULT VALUES
RETURNING         oid
''')
            oid: int = int(cursor.fetchone()[0])
            cursor.execute('''
INSERT INTO       organization
                  ( oid, name )
VALUES            ( %s, %s );
''', (oid, name,))
            cursor.close()

    people: Dict[str, Dict[str, List[str]]] = dict()

    print(f'[*] Importing people ... ')
    with open(os.path.join(DATA, 'people', 'people.csv'), 'r', encoding='utf-8') as f:
        cr: csv.reader = csv.reader(f)
        cols: List[str] = next(cr)
        print(f'[*] Columns: {cols}')
        for row in cr:
            cursor = connection.cursor()
            _, name, memberships, parents, children, partners, assoc = row
            memberships = [ m.split('(https:')[0].strip() for m in memberships.split(', ') ]
            parents = [ p.split('(https:')[0].strip() for p in parents.split(', ') ]
            children = [ c.split('(https:')[0].strip() for c in children.split(', ') ]
            partners = [ p.split('(https:')[0].strip() for p in partners.split(', ') ]
            assoc = [ a.split('(https:')[0].strip() for a in assoc.split(', ') ]
            people[name] = { 'memberships': memberships, 'parents': parents, 'children': children, 'partners': partners, 'assoc': assoc, }
            cursor.execute('''
INSERT INTO       organ
DEFAULT VALUES
RETURNING         oid
''')
            pid: int = int(cursor.fetchone()[0])
            cursor.execute('''
INSERT INTO       person
                  ( pid, firstname, lastname )
VALUES            ( %s, %s, %s );
''', (pid, name.rsplit(' ', 1)[0], name.rsplit(' ', 1)[1],))
            cursor.close()

    print(f'[*] Creating "Mitglied" role ... ')
    with connection.cursor() as cursor:
        cursor.execute('''
INSERT INTO       role
                  ( name )
VALUES            ( 'Mitglied' )
RETURNING         rid''')
        rid: int = int(cursor.fetchone()[0])

    print(f'[*] Importing memberships ... ')
    for name, data in people.items():
        cursor = connection.cursor()
        for membership in data['memberships']:
            if not membership.strip():
                continue
            cursor.execute('SELECT oid FROM organization WHERE name = %s;', (membership,))
            oid: int = int(cursor.fetchone()[0])
            cursor.execute('SELECT pid FROM person WHERE firstname = %s AND lastname = %s;', (name.rsplit(' ', 1)[0], name.rsplit(' ', 1)[1],))
            pid: int = int(cursor.fetchone()[0])
            cursor.execute('''
INSERT INTO       membership
                  ( organ, organization, role, since )
VALUES            ( %s, %s, %s, %s );
''', (pid, oid, rid, '1970-01-01',))

    connection.commit()
    connection.close()

if __name__ == '__main__':
    main()

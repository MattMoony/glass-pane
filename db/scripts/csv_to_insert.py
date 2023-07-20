import csv
import os
from argparse import ArgumentParser
from typing import Iterator, List


def main():
    parser: ArgumentParser = ArgumentParser()
    parser.add_argument('csv_file', type=str, help='CSV file to convert to INSERT statement')
    parser.add_argument('table', type=str, help='The table name of the table where values should be INSERTed')
    args = parser.parse_args()

    print('[!] Please NOTE that this very simple script doesn\'t protect against SQLi ... ')

    if not os.path.isfile(args.csv_file):
        print(f'[-] File doesn\'t exist!')
        return

    print('[+] Execute the following SQL statement to insert the data ... \n')

    with open(args.csv_file, 'r', encoding='utf-8') as f:
        cr: Iterator[List[str]] = csv.reader(f)
        cols: List[str] = next(cr)
        print(f'''
INSERT INTO       {args.table}
                  ( {", ".join(c.lower() for c in cols)} )
VALUES            { (", "+chr(0xa)+"                  ").join("(" + ", ".join(("'" + v + "'") if v else 'NULL' for v in r) + ")" for r in cr) };
'''.strip())

if __name__ == '__main__':
    main()

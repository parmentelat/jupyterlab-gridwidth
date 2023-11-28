"""
a command line tool for en masse migration of notebooks
from the former classic notebook extension 'splitcell' to
the new JupyterLab extension 'gridwidth'

limitations: this assumes jupytext
"""

from argparse import ArgumentParser

import jupytext


def migrate_notebook(notebook):
    print(f'migrating {notebook}')
    with open(notebook, 'r') as f:
        incoming = jupytext.read(f)
    for cell in incoming['cells']:
        if cell.get('metadata', {}).get('cell_style', None) == 'split':
            del cell['metadata']['cell_style']
            if 'tags' not in cell['metadata']:
                cell['metadata']['tags'] = []
            cell['metadata']['tags'].append('gridwidth-1-2')
    # rewrite in same location
    jupytext.write(incoming, notebook)


def main():
    parser = ArgumentParser(
        description='migrate notebooks from (classic)-splitcell to (lab)-gridwidth')
    parser.add_argument('notebooks', nargs='+', help='notebooks to migrate')
    args = parser.parse_args()
    for notebook in args.notebooks:
        migrate_notebook(notebook)
    return 0


if __name__ == '__main__':
    exit(main())

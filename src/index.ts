/*
 * for attaching keybindings later on, see
 * https://towardsdatascience.com/how-to-customize-jupyterlab-keyboard-shortcuts-72321f73753d
 */

/* eslint-disable prettier/prettier */

import { JupyterFrontEnd, JupyterFrontEndPlugin } from '@jupyterlab/application'
import { ICommandPalette } from '@jupyterlab/apputils'
import { INotebookTracker, } from '@jupyterlab/notebook'
import { Cell } from '@jupyterlab/cells'

import { Scope, apply_on_cells } from 'jupyterlab-celltagsclasses'
import { md_toggle_multi, } from 'jupyterlab-celltagsclasses'

const PLUGIN_ID = 'jupyterlab-gridwidth:plugin'

const ALL_GRIDWIDTHS = [12, 13, 23, 14, 24, 34, 15, 25, 35, 45, 16, 26, 36, 46, 56]

const plugin: JupyterFrontEndPlugin<void> = {
  id: PLUGIN_ID,
  autoStart: true,
  requires: [ICommandPalette, INotebookTracker],
  activate: (
    app: JupyterFrontEnd,
    palette: ICommandPalette,
    notebookTracker: INotebookTracker,
  ) => {
    console.log('extension jupyterlab-gridwidth is activating')

    let command

    // gridwidth-12..gridwidth-16
    const ALL_GRIDWIDTHS_FULL = ALL_GRIDWIDTHS.map((gridwidth) => `gridwidth-${gridwidth}`)
    for (const gridwidth of ALL_GRIDWIDTHS) {
      const [num, den] = [Math.floor(gridwidth / 10), gridwidth % 10]
      command = `gridwidth:toggle-${num}${den}`
      app.commands.addCommand(command, {
        label: `cell to take ${num}/${den} space (toggle)`,
        execute: () => apply_on_cells(notebookTracker, Scope.Active,
          (cell: Cell) => {
            console.log(`toggling gridwidth-${gridwidth} for cell ${cell.model.id}`)
            md_toggle_multi(cell, 'tags', `gridwidth-${gridwidth}`, ALL_GRIDWIDTHS_FULL)
          }
        )
      })
      palette.addItem({ command, category: 'gridwidth' })
      app.commands.addKeyBinding({
        command,
        keys: ['Ctrl \\', `Ctrl ${num}`, `Ctrl ${den}`],
        selector: '.jp-Notebook'
      })
    }
    // a shortcut to cancel all gridwidths
    command = 'gridwidth:cancel'
    app.commands.addCommand(command, {
      label: 'cancel all gridwidths',
      execute: () => apply_on_cells(notebookTracker, Scope.Active,
        (cell: Cell) => {
          console.log(`cancelling all gridwidths for cell ${cell.model.id}`)
          md_toggle_multi(cell, 'tags', '', ALL_GRIDWIDTHS_FULL)
        }
      )
    })
    palette.addItem({ command, category: 'gridwidth' })
    app.commands.addKeyBinding({
      command,
      keys: ['Ctrl \\', 'Ctrl 0'],
      selector: '.jp-Notebook'
    })
  }
}

export default plugin

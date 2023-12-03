/*
 * for attaching keybindings later on, see
 * https://towardsdatascience.com/how-to-customize-jupyterlab-keyboard-shortcuts-72321f73753d
 */

/* eslint-disable prettier/prettier */

import { Menu } from '@lumino/widgets'
import { JupyterFrontEnd, JupyterFrontEndPlugin } from '@jupyterlab/application'
import { ICommandPalette, ToolbarButton } from '@jupyterlab/apputils'
import { INotebookTracker } from '@jupyterlab/notebook'
import { ISettingRegistry } from '@jupyterlab/settingregistry'
import { Cell } from '@jupyterlab/cells'

import { Scope, apply_on_cells } from 'jupyterlab-celltagsclasses'
import { md_toggle_multi } from 'jupyterlab-celltagsclasses'

const PLUGIN_ID = 'jupyterlab-gridwidth:plugin'

const ALL_GRIDWIDTHS = [
  '1-2',
  '1-3',
  '2-3',
  '1-4',
  '2-4',
  '3-4',
  '1-5',
  '2-5',
  '3-5',
  '4-5',
  '1-6',
  '2-6',
  '3-6',
  '4-6',
  '5-6'
]

const plugin: JupyterFrontEndPlugin<void> = {
  id: PLUGIN_ID,
  autoStart: true,
  requires: [ICommandPalette, INotebookTracker, ISettingRegistry],
  activate: (
    app: JupyterFrontEnd,
    palette: ICommandPalette,
    notebookTracker: INotebookTracker,
    settingRegistry: ISettingRegistry
  ) => {
    console.log('extension jupyterlab-gridwidth is activating')

    let command

    // gridwidth-1-2..gridwidth-1-6
    const ALL_GRIDWIDTHS_FULL = ALL_GRIDWIDTHS.map(
      gridwidth => `gridwidth-${gridwidth}`
    )
    for (const gridwidth of ALL_GRIDWIDTHS) {
      const [num, den] = gridwidth.split('-')
      command = `gridwidth:toggle-${num}-${den}`
      app.commands.addCommand(command, {
        label: `Toogle Cell to ${num}/${den} of Full Width`,
        execute: () =>
          apply_on_cells(notebookTracker, Scope.Multiple, (cell: Cell) => {
            md_toggle_multi(
              cell,
              'tags',
              `gridwidth-${gridwidth}`,
              ALL_GRIDWIDTHS_FULL
            )
          })
      })
      palette.addItem({ command, category: 'gridwidth' })
      app.commands.addKeyBinding({
        command,
        keys: [`Alt ${num}`, `Alt ${den}`],
        selector: '.jp-Notebook'
      })
    }
    // a shortcut to cancel all gridwidths
    command = 'gridwidth:cancel'
    app.commands.addCommand(command, {
      label: 'Restore Full Cell Width',
      execute: () =>
        apply_on_cells(notebookTracker, Scope.Multiple, (cell: Cell) => {
          md_toggle_multi(cell, 'tags', '', ALL_GRIDWIDTHS_FULL)
        })
    })
    palette.addItem({ command, category: 'gridwidth' })
    app.commands.addKeyBinding({
      command,
      keys: ['Alt 0'],
      selector: '.jp-Notebook'
    })

    notebookTracker.widgetAdded.connect((tracker, panel) => {
      let button: ToolbarButton | undefined

      function loadSetting(setting: ISettingRegistry.ISettings): void {
        // Read the settings and convert to the correct type
        const show_toolbar_button = setting.get('show_toolbar_button')
          .composite as boolean

        // actually this is typed as MenuBar
        const menubar = panel.toolbar

        if (show_toolbar_button) {
          if (button) {
            console.debug('gridwidth: button already on')
            return
          }
          console.debug('gridwidth: adding button', panel.content.node)
          button = new CellWidthMenu(app, tracker).button
          menubar.insertItem(10, 'gridWidth', button)
        } else {
          if (button === undefined) {
            console.debug('gridwidth: button already off')
            return
          }
          console.debug('gridwidth: disposing button', panel.content.node)
          button.dispose()
          button = undefined
        }
      }

      Promise.all([app.restored, settingRegistry.load(PLUGIN_ID)]).then(
        ([_, setting]) => {
          loadSetting(setting)
          setting.changed.connect(loadSetting)
        }
      )
    })
  }
}

// a lumino menu & a toolbar button to invoke the menu
class CellWidthMenu {
  private menuOpen: boolean
  private preventOpen: boolean
  public button: ToolbarButton

  constructor(app: JupyterFrontEnd, notebookTracker: INotebookTracker) {
    this.menuOpen = false
    this.preventOpen = false
    this.button = this.createButton(app, notebookTracker)
  }

  createButton(app: JupyterFrontEnd, notebookTracker: INotebookTracker) {
    // create a lumino menu
    const menu = new Menu({ commands: app.commands })
    menu.title.label = 'Cell Width'

    ALL_GRIDWIDTHS.forEach(gridwidth => {
      const command = `gridwidth:toggle-${gridwidth}`
      menu.addItem({ command })
    })

    menu.addItem({ type: 'separator' })
    menu.addItem({ command: 'gridwidth:cancel' })

    /** About to Close Event: When the aboutToClose event of the menu is emitted
     * (which happens just before the menu is actually closed),
     * the this.menuOpen property is set to false to indicate the menu is not open.
     * Simultaneously, this.preventOpen is set to true to prevent the menu from immediately reopening due to subsequent events.
     * A setTimeout call is used to reset this.preventOpen to false in the next event loop cycle. */
    menu.aboutToClose.connect(() => {
      this.menuOpen = false
      this.preventOpen = true
      // console.log('menu about to close event');
      setTimeout(() => {
        this.preventOpen = false
        // console.log('menu successfully closed and can be opened again.');
      }, 0)
      // console.log('menu is waiting to be closed... prevent it to open...');
    })

    // create a toolbar button to envok the menu
    const button = new ToolbarButton({
      // the icon is similar to the previous split-cell extension button icon
      iconClass: 'fa fa-arrows-h',
      /** Button Click Event: When the toolbar button is clicked, the click event handler checks the state of this.menuOpen.
       * The this.menuOpen is then set to true, indicating the menu is now open.
       * If it's true, the menu is currently open and should be closed.
       * If this.menuOpen is false and this.preventOpen is also false, the menu is not open and should be opened.
       * The rect object represents the button's position, and menu.open positions the menu at the bottom-left of the button.*/
      onClick: () => {
        // console.log('button clicked');
        if (this.menuOpen) {
          // Actually not envoked most of the time, no need to manually close the menu here,
          // because the menu will be closed automatically when this onClick event emits.
          menu.close()
          // console.log('menu closed');
        } else if (!this.preventOpen) {
          const rect = button.node.getBoundingClientRect()
          menu.open(rect.left, rect.bottom)
          this.menuOpen = true
          // console.log('menu opened');
        }
      },
      tooltip: 'Toogle Cell Width'
    })
    return button
  }
}

export default plugin

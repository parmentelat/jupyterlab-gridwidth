# Changelog

## 0.4.3 2024 Aug 19

- cleanup css, remove rules that no longer belong here
  because they are now in either of jupyterlab-{courselevels,hidecell}

## 0.4.2 2024 Jun 9

- workaround #16: revert to `defer` for `windowingMode` in the notebook settings,
  unless the local setting 'windowing_mode_defer' is set to `false`

## 0.3.1 2024 Feb 24

- splitcell-to-gridwidth is careful to avoid duplicate tags

## 0.3.0 2024 Feb 24

- fix #14

## 0.2.4 2023 Dec 3

- update README-use-case to show action on multiple cells

## 0.2.3 2023 Dec 3

- actions apply on all selected cells, not just the active one
- more helpful readme with a gif micro demo

## 0.2.2 2023 Dec 1

- explicitly require jupyterlab-celltagsclasses to be at least 0.5

## 0.2.1 2023 Dec 1

- make sure to use at least celltagsclasses 0.5.0

## 0.2.0 2023 Dec 1

- fix #6
- now the button gets added in the right panel
  however there are times where it goes leftmost in the toolbar...

## 0.1.6 2023 Nov 29

- an attempt at improving issue #6
- still not perfect, there are still glitches
  when several notebooks are present

## 0.1.5 2023 Nov 29

- turn dropdown on or off with settings editor

## 0.1.4 2023 Nov 29

- merged #5 - add button in toolbar
  thanks @firezym

## 0.1.3 2023 Nov 28

- merged #4 - keyboard shortcuts are now in the form
  Alt-1 Alt-2 etc, or just Alt-0
  thanks @firezym

## 0.1.2 2023 Nov 27

- expose command `split-cell-to-gridwidth` to convert notebooks

## 0.1.1 2023 Nov 27

- initial release

# Rock Band - Save & Cache web tool

![Screenshot](./assets/screenshot.jpg)

## Purpose

Lets the user read their save and cache file from Rock Band 3 and show them in a table format.

## Usage

If given both files their data will be combined to single row by song id but the user can also just give just either one.

## Modes

### Primary file

If both are given they can be viewed from either files perspective and only the songs from that file are listed.

### Table mode

Virtualized table (default) only renders just beyond the viewport which greatly increase performance for all functionalities like sort, resize columns and toggling column visibility. Only downside is that native search of brosers will only target the rendered data and not out of view data.
Un-virtualized table has a lot of functionalities removed to make the performance tolarable but still slower than the virtualized table but you can search the whole table.

## Credits

This app would not be possible without the groundwork, tools, and assistance of many others.

Credit where credit is due:

- **trojannemo** — Nautilus with cache file logic, dta parsing and stfs-file extracting
  https://github.com/trojannemo/Nautilus

- **StackOverflow0x** — Save Scores Viewer with logic to decrypt the Rock Band 3 save file contents.

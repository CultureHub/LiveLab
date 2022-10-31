# Changelog
## [1.4.9] - 2022-10-27
### Fixed
- 

### Changed
- Adds the ability to mirror your local video and turns this on by default


## [1.4.8] - 2021-09-20
### Fixed
- Switcher popping out does not interrupt audio

### Changed
- Window popup code in `utils.js` file
- room id added to popout window title and id
- window associated to a specific stream id (does not recreate window when adding a new window with the same id)

## [1.4.7] - 2021-09-16
### Fixed 
- audio not interrupted when window popped out

## [1.4.6] - 2021-07-28
### Fixed
- streams removed on remote peers when removed locally


## [1.4.5] - 2020-02-25
### Changed
- Temporarily removed max audio bandwidth until there is a ui

## [1.4.4] - 2020-12-9
### Added
- higher max bandwidth for audio (sdp transform in MultiPeer.js)
- user feedback for audio settings
- audio preview of currently selected stream
- show actual settings of selected stream and device, in red when they are not accurate
- share audio of chrome tab

### Fixed
- stop audio stream before changing params

## [1.4.3] - 2020-12-3
### Changed
- Restart audio stream before applying constraints (should improve audio checkbox issue)

## [1.4.2] - 2020-11-25
### Fixed
- typo in room reconnection
- checks for local socket id before trying to reconnect
- rejoins room when connection is lost

## [1.4.1] - 2020-11-18
### Added
 - instructions for running locally to README
 - "start" script automatically rebuilds for production

## [1.4.0] - 2020-08-18
### Added
- rooms specified on each signalling call
- Updated to work with v0.0.2 of signalling server

### Fixed
- this._room renamed to this.room on reconnect

## [1.3.10] - 2020-06-18
### Changed
 - switched to nanoid and randomIds rather than sequential
 - absolute path for preview images
 - moved changelog to its own file

## [1.3.9] - 2020-06-05
### Changed
 - added linter
 - cleaned up code
 - different range slider styling
 - added screen share icon

## [1.3.8] - 2020-06-03
### Added
 - toggle between floating layout and column layout in settings
 - colors as variables in layout
 - icons on landing page
 - font rektorant
 - button class
 - info to login page
 - buttons to login page
 - chat pops out when closed

### Changed
 - label removed from initial 'add media' page
 - accent color

## [1.3.6] - 2020-05-28
### Added
 - dev and production builds to specify different server address
 - version number included as environmental variable
 - settings panel
 - setting to configure number of switchers
 - column layout
 - overlay showing switcher value
 - x to end stream

### Changed
 - switcher can be toggled directly

## [1.3.4] - 2020-05-26
### Added
 - New layout for login
 - user info in 'peer list'
 - video grid adjusts to mobile layout
 - dedicated column for menu

### Changed
 - updated media settings
 - moved unused files to 'older'
 - media info removed from grid and added to peerslist

## [1.3.3] - 2020-05-22
### Changed
 - Add Media instead of addAudio()

## [1.3.2] - 2020-05-17
### Added
  - Global hangup
  - Switcher A and B
  - buttons for share, add video, add audio, help/info (non-functional)
  - Chat opens when a chat is received and window is closed
  - collapsible menu
  - 'advanced' and 'basic' menu
  - add audio with mic visualization

### Changed
  - Icons for bounding box, end call, share window
  - Audio mixer uses HTML elements rather than web audio ()

## [1.3.1] - 2020-05-12
### Added
  - hangup buttons for individual streams
  - indicator of number of users in room

## [1.3.0] - 2020-05-03
  Major refactor
### Changed
  - All state related to media streams contained in MultiPeer.js
  - choo stores only used for ui state
  - login, media settings, chat are all stateful components that only rerender when needed

### Fixed
  - bug on page load in safari

### Added
  - Audio mixer
  - popout window button
  - video mute
  - adaptive layout + layout controls
  - all users can see muted streams

## [1.2.5] - 2020-03-31
### Changed
 - scrollable track info
 - removed bandwidth info
 - no volume control for own audio
 - colors for muting and volume control

## [1.2.4] - 2020-03-31
### Added
 - controls for echoCancellation, autoGainControl, and noiseSuppressiong

## [1.2.3] - 2020-03-28
### Fixed
 - building and running the desktop on multiple platforms and without requiring nw.js to be installed globally

## [1.2.2] - 2020-03-28
### Added
 - screensharing

## [1.2.1] - 2020-03-27
### Added
 - room and nickname info saved to local storage
 - Room added to URL query params: '?room=roomName'. When using with sendOnly, follow format 'https://livelab.app?room=roomName#sendOnly'
 - Room name auto-populated on login page when specified in query

## [1.2.0] - 2020-03-26
### Added
 - client rejoins room when server is reconnected
 - [server update] added 'getPeers' function so that client can query for existing peers in room
 - client reconnects to peers when internet connection is rest

### Changed
 - Logs using built in Choo logging function, so that later it will be easier to show logs to user

### Fixed
  - Catch 'Ice Connection Failed' error -- removes ghost black screens

## [1.1.1] - 2020-02-12
### Fixed
 - Updated route for gh-pages

## [1.1.0] - 2020-02-12
### Added
=======

## [1.4.0] - 2020-08-18

### Added
- rooms specified on each signalling call
- Updated to work with v0.0.2 of signalling server

### Fixed
- this._room renamed to this.room on reconnect

## [1.3.10] - 2020-06-18

### Changed

- switched to nanoid and randomIds rather than sequential
- absolute path for preview images
- switcher dropdown menu bug fixed
- moved changelog to its own file

## [1.3.9] - 2020-06-05

### Changed

- added linter
- cleaned up code
- different range slider styling
- added screen share icon

## [1.3.8] - 2020-06-03

### Added

- toggle between floating layout and column layout in settings
- colors as variables in layout
- icons on landing page
- font rektorant
- button class
- info to login page
- buttons to login page
- chat pops out when closed

### Changed

- label removed from initial 'add media' page
- accent color

## [1.3.6] - 2020-05-28

### Added

- dev and production builds to specify different server address
- version number included as environmental variable
- settings panel
- setting to configure number of switchers
- column layout
- overlay showing switcher value
- x to end stream

### Changed

- switcher can be toggled directly

## [1.3.4] - 2020-05-26

### Added

- New layout for login
- user info in 'peer list'
- video grid adjusts to mobile layout
- dedicated column for menu

### Changed

- updated media settings
- moved unused files to 'older'
- media info removed from grid and added to peerslist

## [1.3.3] - 2020-05-22

### Changed

- Add Media instead of addAudio()

## [1.3.2] - 2020-05-17

### Added

- Global hangup
- Switcher A and B
- buttons for share, add video, add audio, help/info (non-functional)
- Chat opens when a chat is received and window is closed
- collapsible menu
- 'advanced' and 'basic' menu
- add audio with mic visualization

### Changed

- Icons for bounding box, end call, share window
- Audio mixer uses HTML elements rather than web audio ()

## [1.3.1] - 2020-05-12

### Added

- hangup buttons for individual streams
- indicator of number of users in room

## [1.3.0] - 2020-05-03

Major refactor

### Changed

- All state related to media streams contained in MultiPeer.js
- choo stores only used for ui state
- login, media settings, chat are all stateful components that only rerender when needed

### Fixed

- bug on page load in safari

### Added

- Audio mixer
- popout window button
- video mute
- adaptive layout + layout controls
- all users can see muted streams

## [1.2.5] - 2020-03-31

### Changed

- scrollable track info
- removed bandwidth info
- no volume control for own audio
- colors for muting and volume control

## [1.2.4] - 2020-03-31

### Added

- controls for echoCancellation, autoGainControl, and noiseSuppressiong

## [1.2.3] - 2020-03-28

### Fixed

- building and running the desktop on multiple platforms and without requiring nw.js to be installed globally

## [1.2.2] - 2020-03-28

### Added

- screensharing

## [1.2.1] - 2020-03-27

### Added

- room and nickname info saved to local storage
- Room added to URL query params: '?room=roomName'. When using with sendOnly, follow format 'https://livelab.app?room=roomName#sendOnly'
- Room name auto-populated on login page when specified in query

## [1.2.0] - 2020-03-26

### Added

- client rejoins room when server is reconnected
- [server update] added 'getPeers' function so that client can query for existing peers in room
- client reconnects to peers when internet connection is rest

### Changed

- Logs using built in Choo logging function, so that later it will be easier to show logs to user

### Fixed

- Catch 'Ice Connection Failed' error -- removes ghost black screens

## [1.1.1] - 2020-02-12

### Fixed

- Updated route for gh-pages

## [1.1.0] - 2020-02-12

### Added
- Interface for sending media without receiving, with separate route at #sendonly
- Flag for each peer 'requestMedia', indicating whether that peer should receive media
- Peers no longer send media by default, only when requested. (breaking change / not compatible with earlier versions)

## [1.0.2] - 2020-02-11
### Changed
- Updated choo devtools

## [1.0.1] - 2020-02-11
### Changed

- Updated choo devtools

## [1.0.1] - 2020-02-11

### Added
- Version number on login page
- Changelog

### Fixed
- Audio turning off when show control open

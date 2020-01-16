### LiveLab

[demo (right now only works in Chrome)](https://livelab.glitch.me/)

### Desktop capture
To use screen capture or a browser tab as an input source, you must first install the chrome extension for screensharing, and restart chrome.

To install, go to chrome://extensions/
Click "Load unpacked extension", and select the "extensions" folder in "screen-capture-extension" in this repo. Restart chrome. The extension should work from now on without needing to reinstall.

### Running locally

To run locally, you must have nodejs and npm installed. Install from: https://nodejs.org/en/

Download the repository, open terminal, and enter directory
```
cd LiveLab
```

install dependencies:
```
npm install -d
```

The repo contains a desktop version built using nw.js, and a browser-based version. Some features, such as broadcast and relaying OSC channels, are only available in the desktop version.

Run the browser version:
```
npm run start-local
```

To run the desktop version, first install nwjs as a command-line utility.
```
npm install -g nwjs
```
Then, install version 0.28.0 of nwjs:
```
nw install 0.28.0-sdk
```
Run the desktop app:
```
npm run start-nw
```

To develop either version, open a separate command line and type
```
npm run watch
```

## About LiveLab | https://livelab.app

LiveLab is a browser-based media routing software designed for collaborative performance by [CultureHub](https://culturehub.org), a global art & technology community founded by SeoulArts & La MaMa.

It is a new tool that empowers artists and arts presenters to meet, create, collaborate, rehearse, and ultimately produce multi-location performances from virtually anywhere in the world. This innovative video collaboration software expands the current field of offerings by allowing users to customize media in ways that best suit their needs.

**Feature highlights:**

- add multiple cameras, audio streams, and screen shares to the same session from one laptop
- dynamically add and remove audio and video feeds
- send video feeds to separate windows
- use audio mixer to control the master volume as well as the output volume of individual feeds
- video switcher to switch between video feeds
- chat, who doesn't like?

More info about LiveLab and how it is used in performance production by CultureHub, its creating organization: https://www.culturehub.org/livelab

## 🎉🎉 LiveLab beta LAUNCHED!

LiveLab is open-source and free to use. To access:

1. go to https://livelab.app using Chrome Browser or Android tablet devices
2. Ensure the appropriate video and audio sources are selected
3. Click 'start' to join a room with a randomly generated room name
4. Share the URL with other people in order to add them to the session

## LiveLab Resources
### Tutorials
- [First Things to Know about LiveLab](https://github.com/CultureHub/LiveLab/issues/6)

### Signalling server
   To build and modify your own LiveLab signalling server that runs locally, check out our Github repo about [LiveLab Signalling Server](https://github.com/CultureHub/LiveLab_server)

### To run locally (must have nodejs and npm installed)
1. clone this repo
2. install dependencies
```
npm install -d
```
3. generate locally-signed ssl certificates
a. create a folder called 'certs' in the main directory
b. generate certificate and public key:
```
openssl req -x509 -out certs/fullchain.pem -keyout certs/privkey.pem \
  -newkey rsa:2048 -nodes -sha256 \
  -subj '/CN=localhost' -extensions EXT -config <( \
   printf "[dn]\nCN=localhost\n[req]\ndistinguished_name = dn\n[EXT]\nsubjectAltName=DNS:localhost\nkeyUsage=digitalSignature\nextendedKeyUsage=serverAuth")
```

4. To run a development server and automatically re-build as files are changed:
```
npm run dev
```
The development server uses a test signalling server hosted at 'https://live-lab-v1.glitch.me'.

5. To build a production version:
```
npm run build
```
Make sure to specify your own signalling server in the file 'app/stores/userStore.js'.

6. To run the server:
```
npm run start
```
7. go to https://localhost:8000 to show application. Note: you may need to 'hard refresh'

See the [changelog](CHANGELOG.md) for most recent updates.

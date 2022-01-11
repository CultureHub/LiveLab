
## About LiveLab | https://livelab.app

LiveLab is a browser-based media routing software designed for collaborative performance by [CultureHub](https://culturehub.org), a global art & technology community founded by SeoulArts & La MaMa.

It is a new tool that empowers artists and arts presenters to meet, create, collaborate, rehearse, and ultimately produce multi-location performances from virtually anywhere in the world. This innovative video collaboration software expands the current field of offerings by allowing users to customize media in ways that best suit their needs.

## Feature Highlights:

- Add multiple cameras, audio streams, and screen shares to the same session from one laptop
- Dynamically add and remove audio and video feeds
- Send video feeds to separate windows
- Use audio mixer to control the master volume as well as the output volume of individual feeds
- Video switcher to switch between video feeds
- Chat, who doesn't like?

More info about LiveLab and how it is used in performance production by CultureHub, its creating organization: https://www.culturehub.org/livelab <br>
See the [changelog](CHANGELOG.md) for most recent updates.

## How to Use LiveLab

LiveLab is open-source and free to use. To access:

1. Go to https://livelab.app using Chrome Browser or Android tablet devices
2. Ensure the appropriate video and audio sources are selected
3. Click 'start' to join a room with a randomly generated room name
4. Share the URL with other people in order to add them to the session


### How To Run It Locally (must have nodejs and npm installed)

1. Clone this repo

```
git clone https://github.com/CultureHub/LiveLab.git
```

2. Navigate to the repo

```cd < LiveLab repo location >```

3. Install dependencies

```
npm install -d
```

4. Create a folder called `certs` inside the main directory
```
mkdir certs
```

5. Generate locally-signed ssl certificates (these will go inside the `certs` folder you just made)

```
openssl req -x509 -out certs/fullchain.pem -keyout certs/privkey.pem \
  -newkey rsa:2048 -nodes -sha256 \
  -subj '/CN=localhost' -extensions EXT -config <( \
   printf "[dn]\nCN=localhost\n[req]\ndistinguished_name = dn\n[EXT]\nsubjectAltName=DNS:localhost\nkeyUsage=digitalSignature\nextendedKeyUsage=serverAuth")
```

6. To run a development server and automatically re-build as files are changed:

```
npm run dev
```

7. Go to https://localhost:8000 to show application. Note: you will need to `hard refresh` to view changes you make


#### The development server uses a test signalling server hosted at 'https://live-lab-v1.glitch.me'.

To build a production version:

```
npm run build
```

Make sure to specify your own signalling server in the file 'app/stores/userStore.js'.

To run the server:

```
npm run start
```

## LiveLab Resources

### Tutorials

[Learn & Support: Video Tutorials by CultureHub](https://www.culturehub.org/livelab/#livelab-learn-support)

### Signalling Server

To build and modify your own LiveLab signalling server that runs locally, check out our Github repo about [LiveLab Signalling Server](https://github.com/CultureHub/LiveLab_server)

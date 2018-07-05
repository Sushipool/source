# sushipool-electron-miner

A desktop Electron GUI to mine [Nimiq](https://nimiq.com), a browser-based cryptocurrency, developed for [Sushipool](https://sushipool.com).

First install nvm from https://github.com/creationix/nvm to let you run multiple Node.js versions in parallel. Activate Node.js LTS (version 8.11.3) 

```bash
$ nvm install 8.11.3
$ nvm use 8.11.3
```

and type the following commands:

```bash
$ git clone https://github.com/Sushipool/source.git
$ cd source/electron/
$ npm install
$ node_modules/.bin/electron-rebuild
$ npm start
```

## License

[GNU GPL 3.0](LICENSE.md)
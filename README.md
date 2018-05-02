## SushiPool Website and Downloadable Clients

### 1. Instruction to run the SushiPool nodejs miner.

To start mining using the SushiPool nodejs, type the following command.

```
$ cd miner
$ yarn
$ ./sushipool
```

By default, configurations will be read from `sushipool.conf` (a JSON file). If no configuration file is found, the script will prompt the user to enter parameter values before saving them into a configuration file. Alternatively you can also specify a different config file when starting the miner. The `--test` parameter can be passed to run the script on the testnet, e.g.

```
$ ./sushipool --config=sushipool.conf --test
```

The miner script establishes light consensus with the network. If you are running it for the first time, it might take a while to download that, so you can copy the `main-light-consensus` or `test-light-consensus` folders from elsewhere if you have them. Statistics will be printed every 5 seconds, so we don't need to specify that parameter anymore.

### 2. How to build stand-alone binaries.

In the step above, we need to have nodejs and all the dependencies required by the miner to be installed. However, often user prefers to run a stand-alone binary file on their system. Follow the steps below to create one.

We will use [pkg](https://github.com/zeit/pkg) to create the stand-alone binary. First we need to install `pkg`:

```
$ npm install -g pkg
```

Then change to the `scripts` directory and run the following, depending on your platform:

```
$ ./build.sh node9 macos x64 'tag' # macos 64-bit
$ ./build.sh node9 linux x64 'tag '# linux 64-bit
$ ./build.sh node9 win x64 'tag'  # win 64-bit
```
where 'tag' is any string that is used to tag this release, e.g. 'standard', 'fast, 'extreme'
The output for the command above can be found at `../../binaries`. Run it the same way as in step (1).
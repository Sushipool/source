## SushiPool Website and Downloadable Clients

### 1. Instruction to run the SushiPool nodejs miner.

To start mining using the SushiPool nodejs, type the following command.

```
$ cd miner
$ yarn
$ ./sushipool
```

By default, configurations will be read from `sushipool.conf`. Alternatively you can also specify a different config file when starting the miner:

```
$ ./sushipool --config=sushipool.conf
```

If you are running the miner for the first time, it will download the full consensus data for the network.
This might take a while (you can also copy the `main-light-consensus` or `test-light-consensus` from elsewhere if you have them).
Statistics will be printed every 5 seconds, so we don't need to specify that parameter anymore.
Similarly, the `--extraData` parameter is now set automatically.

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
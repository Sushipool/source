#!/bin/bash
# Easy Setup Script for NodeJS Nimiq Miner
echo "  _________            .__    .__                       "
echo "/   _____/__ __  _____|  |__ |__|                      "
echo "\_____  \|  |  \/  ___/  |  \|  |                      "
echo "/        \  |  /\___ \|   Y  \  |                      "
echo "/_______  /____//____  >___|  /__|                      "
echo "        \/           \/     \/                          "
echo ""
echo "__________             .__                              "
echo "\______   \____   ____ |  |                             "
echo "|     ___/  _ \ /  _ \|  |                             "
echo "|    |  (  <_> |  <_> )  |__                           "
echo "|____|   \____/ \____/|____/                           "
echo ""

#Get Settings

echo 'Using eu.sushipool.com at port 443.'
usePool="--pool=eu.sushipool.com:443"
nimiqScript="mine.sh"

echo 'Please enter the number of threads: '
read nimiqThreads

echo 'Enter Wallet Address (NOT SEED): '
read nimiqAddress

echo 'Enter Extra-Data Field (Optional, useful for multiple miners on the same address): '
read nimiqExtra

#Required Setup
echo 'Updating packages. Please enter your sudo password if prompted.'
sudo apt-get update
sudo apt-get -y upgrade

#Install requirements
sudo apt-get install -y curl git build-essential python

#Setup NodeJS
curl -sL https://deb.nodesource.com/setup_9.x | sudo -E bash -
sudo apt-get install -y nodejs

sudo npm install -g yarn
yarn global add gulp

git clone https://github.com/nimiq-network/core

nimiqDoD="--dumb"

#Generate Mining Runscript
touch $nimiqScript
chmod +x $nimiqScript

echo "cd core && git pull && yarn " > $nimiqScript

echo "cd clients/nodejs/" >> $nimiqScript

echo "env UV_THREADPOOL_SIZE=$nimiqThreads node index.js $usePool --wallet-address=\"$nimiqAddress\" --miner=$nimiqThreads --statistics=10 $nimiqDoD" >> $nimiqScript
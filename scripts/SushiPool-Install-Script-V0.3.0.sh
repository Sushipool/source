#!/usr/bin/env bash

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
echo

while read -p "Enter Nimiq Wallet Address (e.g. NQXX .... ....): `echo $'\n> '`" NIMIQ_ADDR; do
    echo "You entered the following address:"
    echo  ${NIMIQ_ADDR}
    read -p "Is that correct? [y/n] " REPLY
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        break
    fi
done

echo

NUM_CORES=$(grep -c ^processor /proc/cpuinfo)
while read -p "Enter the number of threads to use for mining (max ${NUM_CORES}): `echo $'\n> '`" THREADS; do
    if ! [ "$THREADS" -eq "$THREADS" ] 2> /dev/null; then
		echo "Please enter a number."
    else
        break
	fi
done

POOLSERVER_EU='eu.sushipool.com'
POOLSERVER_US='us-east.sushipool.com'
POOLSERVER_ASIA='asia.sushipool.com'

echo
echo "🍣 Sushi Servers:"
echo "1. ${POOLSERVER_EU}"
echo "2. ${POOLSERVER_US}"
echo "3. ${POOLSERVER_ASIA}"

POOLSERVER=''
POOLPORT=443
while read -p "Enter the pool server nearest to you: `echo $'\n> '`" pool; do
    if ! [ "$pool" -eq "$pool" ] 2> /dev/null; then
        echo "Please select a valid server (1, 2 or 3)."
    else
        case $pool in
        1)
          POOLSERVER=${POOLSERVER_EU}
          break
          ;;
        2)
          POOLSERVER=${POOLSERVER_US}
          break
          ;;
        3)
          POOLSERVER=${POOLSERVER_ASIA}
          break
          ;;
        *)
          echo "Please select a valid server (1, 2 or 3)."
          ;;
        esac
	fi
done

echo
echo "---------------------------------------------------------------------------"
echo "The following configurations will be saved and used in all subsequent runs:"
echo "Nimiq Wallet Address: ${NIMIQ_ADDR}"
echo "No. of threads: ${THREADS}"
echo "Pool server: ${POOLSERVER}:${POOLPORT}"
echo "---------------------------------------------------------------------------"

echo
echo 'Installing dependencies. Please enter your sudo password if prompted.'
curl -sL https://deb.nodesource.com/setup_9.x -o nodesource_setup.sh
sudo bash nodesource_setup.sh
sudo apt-get -y install nodejs build-essential git
sudo npm install -g yarn
sudo npm install -g gulp
sudo chown -R ${USER}:${USER} ~/.config
git clone https://github.com/nimiq-network/core
cd core
yarn
yarn build

echo
echo 'Generating mining script (mine.sh)'
cd ..
STATISTICS=1
echo '#!/bin/bash
UV_THREADPOOL_SIZE='"${THREADS}"' ./core/clients/nodejs/nimiq --dumb --pool='"${POOLSERVER}:${POOLPORT}"' --miner='"${THREADS}"' --wallet-address="'"${NIMIQ_ADDR}"'" --statistics='"${STATISTICS}"'' > mine.sh
chmod u+x mine.sh

echo 'Installation finished. To start mining, type ./mine.sh'
echo

echo 'Launching miner script'
./mine.sh
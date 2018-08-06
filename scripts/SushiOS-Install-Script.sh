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
echo 'Installing dependencies. Please enter your sudo password if prompted.'

sudo apt-get install -y gcc g++ make nodejs dialog screen curl git
curl -sL https://deb.nodesource.com/setup_9.x -o nodesource_setup.sh
sudo bash nodesource_setup.sh
sudo apt-get install -y nodejs

curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt-get update && sudo apt-get install -y yarn build-essential

if [ -d "source" ]; then
    echo 'Existing source directory found. Updating to latest SushiPool codes.'
    cd source/miner
    git pull
else
    echo 'Cloning the latest SushiPool codes.'
    git clone https://github.com/Sushipool/source
    cd source/miner
fi
yarn

echo -e "Starting SushiPool miner."
HOSTNAME=$(hostname)
THREADS=$(grep -c ^processor /proc/cpuinfo)
./sushipool --threads ${THREADS} --name ${HOSTNAME}

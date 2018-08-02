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

# apply temporary WSL workaround, see https://github.com/nimiq-network/core/issues/387
if grep -q Microsoft /proc/version; then
    echo 'WSL detected, applying workaround.'
    sed -i 's/dist\/lmdb.js/dist\/leveldb.js/' node_modules/@nimiq/jungle-db/package.json
fi

RED='\033[0;31m'
NC='\033[0m' # No Color
echo 'startup_message off' >> ~/.screenrc

ans=`DIALOG_ERROR=5 DIALOG_ESC=1 dialog --timeout 120 \
           --menu "Do you wish to start the SushiPool miner? (this message will time-out in 120s.)" 20 73 8 \
           "1) Yes" "Run miner." \
           "2) Yes, in background" "Run miner using screen." \
           "3) No" "Quit installation." \
    3>&1 1>&2 2>&3`
rc=$?
case $rc in
   0) case "$ans" in
        "1) Yes")
            printf "\033c"
            echo -e "Starting SushiPool miner."
            ./sushipool
            exit;;
        "2) Yes, in background")
            printf "\033c"
            echo -e "Starting SushiPool miner in a screen session."
            echo "To detach a screen session and return to your normal SSH terminal, type CTRL+A D"
            echo "You can also close your SSH now, and the miner will continue running."
            echo -e "To return to the miner next time, type ${RED}screen -x${NC}."
            read -n 1 -s -r -p "Press any key to continue."
            screen ./sushipool
            exit;;
        "3) No")
            echo -e "Installation finished. To start mining, type:"
            echo -e "${RED}$ cd source/miner${NC}"
            echo -e "${RED}$ ./sushipool${NC}"
            echo
            exit;;
      esac;;
   *)
       printf "\033c"
       echo -e "Starting SushiPool miner."
       ./sushipool
      exit;;
esac

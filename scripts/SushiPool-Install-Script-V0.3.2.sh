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

curl -sL https://deb.nodesource.com/setup_9.x -o nodesource_setup.sh
sudo bash nodesource_setup.sh
sudo apt-get install -y gcc g++ make nodejs dialog

curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt-get update && sudo apt-get install -y yarn

git clone https://git.codehou.se/sushipool/miner/source.git
cd source/miner
yarn

RED='\033[0;31m'
NC='\033[0m' # No Color
echo 'startup_message off' >> ~/.screenrc

ans=`DIALOG_ERROR=5 DIALOG_ESC=1 dialog --timeout 30 \
           --menu "Do you wish to start the SushiPool miner? (this message will time-out in 30s)" 20 73 8 \
           "1) Yes" "Run the SushiPool miner in the background." \
           "2) No" "Quit installation." \
    3>&1 1>&2 2>&3`
rc=$?
case $rc in
   0) case "$ans" in
        "1) Yes")
            printf "\033c"
            echo -e "SushiPool miner is going to start in a screen session."
            echo "You can close your terminal and it will continue running."
            echo -e "To return to the miner next time, type ${RED}screen -x${NC}."
            read -n 1 -s -r -p "Press any key to continue."
            screen ./sushipool
            exit;;
        "2) No")
            echo -e "Installation finished. To start mining, type:"
            echo -e "${RED}$ cd source/miner${NC}"
            echo -e "${RED}$ ./sushipool${NC}"
            echo
            exit;;
      esac;;
   *)
      echo
      echo -e "Starting SushiPool miner in the foreground."
      ./sushipool
      exit;;
esac
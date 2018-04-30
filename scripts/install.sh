 #!/bin/bash
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
echo 'Checking dependencies...'
command -v unzip >/dev/null 2>&1 || { echo 'Installing unzip'; apt -qq update && apt install unzip -y; }
command -v git >/dev/null 2>&1 || { echo 'Installing git'; apt -qq update && apt install git -y; }

if ! [ -x "$(command -v git)" ]; then
  echo 'Installing node'
  curl -sL https://deb.nodesource.com/setup_9.x | bash
  apt-get -y nodejs build-essential git

fi
echo "Installing yarn"
npm install -g yarn > /dev/null
echo "Installing gulp"
npm install -g gulp > /dev/null

read -p "Enter nimiq address: `echo $'\n> '`" NIMIQ_ADDR

echo "You entered the following address:"
echo  $NIMIQ_ADDR
read -p "Is that correct? [y/N]" REPLY
echo ""
REPLY=${REPLY,,}
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter the number of threads: `echo $'\n> '`" THREADS
	if ! [ "$THREADS" -eq "$THREADS" ] 2> /dev/null
	then
		echo "Sorry integers only"
		exit
	fi
	echo "Going to use $THREADS threads"
fi
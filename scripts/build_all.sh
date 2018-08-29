#!/usr/bin/env bash

# we build the binaries using https://github.com/zeit/pkg
# please install it first with `npm install -g pkg`

: ${1?"Usage: $0 nodeVersion platform arch tag, where nodeVersion is e.g. 'node9'"}
: ${2?"Usage: $0 nodeVersion platform arch tag, where platform is 'freebsd', 'linux', 'macos', 'win'"}
: ${3?"Usage: $0 nodeVersion platform arch tag, where arch is 'x64', 'x86', 'armv6', 'armv7'"}

NODE_VERSION=$1 # nodeVersion node${n} or latest
PLATFORM=$2 # platform freebsd, linux, macos, win
ARCH=$3 # arch x64, x86, armv6, armv7

PACKAGE_VERSION=$(cat ../miner/package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g' \
  | xargs)
echo 'Building SushiPool Miner '${PACKAGE_VERSION}
BINARIES_DIR='./binaries'

cd ../miner
rm -rf node_modules

# run yarn for the first time to fetch all the dependencies we need
yarn

# copy binding.gyp containing our optimisation
cp ../scripts/SushiPool_binding.gyp node_modules/@nimiq/core/binding.gyp

# rebuild native modules
npm rebuild

# now we loop through each cpu architecture to package
# please use GCC 8 for the best performance!
# - https://askubuntu.com/questions/1039244/how-do-i-use-the-latest-gcc-on-ubuntu-ubuntu-18-04-gcc-8-1
# - https://askubuntu.com/questions/1028601/install-gcc-8-only-on-ubuntu-18-04
cd ../scripts
declare -a arr=("compat"
                "sse2"
                "avx2"
                "avx512f"
                )
for i in "${arr[@]}"
do
    PACKAGE_DIR='sushipool-'${PLATFORM}-${ARCH}-${PACKAGE_VERSION}-${i}
    OUTPUT_DIR=${BINARIES_DIR}'/'${PACKAGE_DIR}
    echo 'Creating package at '${OUTPUT_DIR}
    mkdir -p ${OUTPUT_DIR}
    pkg --target ${NODE_VERSION}-${PLATFORM}-${ARCH} --output ${OUTPUT_DIR}/'sushipool' ../miner/index.js

    echo 'Copying native codes'
    cp ../miner/node_modules/@nimiq/core/build/Release/nimiq_node_${i}.node ${OUTPUT_DIR}/nimiq_node.node
    cp ../miner/node_modules/node-lmdb/build/Release/node-lmdb.node ${OUTPUT_DIR}
    if [ "$PLATFORM" = "macos" ]; then
        cp ../miner/node_modules/uws/uws_darwin_59.node ${OUTPUT_DIR}
    elif [ "$PLATFORM" = "linux" ]; then
        cp ../miner/node_modules/uws/uws_linux_59.node ${OUTPUT_DIR}
    elif [ "$PLATFORM" = "win" ]; then
        cp ../miner/node_modules/uws/uws_win32_59.node ${OUTPUT_DIR}
    fi

    echo 'Creating tar file'
    cd ${BINARIES_DIR}
    tar cvzf ${PACKAGE_DIR}.tar.gz ${PACKAGE_DIR}
    echo 'Successfully created '${BINARIES_DIR}/${PACKAGE_DIR}.tar.gz

    echo 'Cleaning up'
    cd ..
    rm -rf ${OUTPUT_DIR}

    echo

done

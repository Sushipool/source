#!/usr/bin/env bash

# we build the binaries using https://github.com/zeit/pkg
# please install it first with `npm install -g pkg`

: ${1?"Usage: $0 nodeVersion platform arch tag, where nodeVersion is e.g. 'node9'"}
: ${2?"Usage: $0 nodeVersion platform arch tag, where platform is 'freebsd', 'linux', 'macos', 'win'"}
: ${3?"Usage: $0 nodeVersion platform arch tag, where arch is 'x64', 'x86', 'armv6', 'armv7'"}
: ${4?"Usage: $0 nodeVersion platform arch tag, where tag is any string to tag this release"}

NODE_VERSION=$1 # nodeVersion node${n} or latest
PLATFORM=$2 # platform freebsd, linux, macos, win
ARCH=$3 # arch x64, x86, armv6, armv7
TAG=$4 # e.g. 'standard', 'fast', 'extreme'

PACKAGE_VERSION=$(cat ../miner/package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g' \
  | xargs)
echo 'Building SushiPool Miner '${PACKAGE_VERSION}
BINARIES_DIR='./binaries'
PACKAGE_DIR='sushipool-'${PLATFORM}-${ARCH}-${PACKAGE_VERSION}-${TAG}
OUTPUT_DIR=${BINARIES_DIR}'/'${PACKAGE_DIR}

cd ../miner
yarn

cd ../scripts
echo 'Creating package at '${OUTPUT_DIR}
mkdir -p ${OUTPUT_DIR}
pkg --target ${NODE_VERSION}-${PLATFORM}-${ARCH} --output ${OUTPUT_DIR}/'sushipool' ../miner/index.js

echo 'Copying native codes'
cp ../miner/node_modules/@nimiq/core/build/Release/nimiq_node.node ${OUTPUT_DIR}
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

echo 'Cleaning up'
cd ..
rm -rf ../miner/node_modules
rm -rf ${OUTPUT_DIR}

echo
echo 'Successfully created:'
echo ${BINARIES_DIR}/${PACKAGE_DIR}.tar.gz
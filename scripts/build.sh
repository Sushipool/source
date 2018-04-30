#!/usr/bin/env bash

# we build the binaries using https://github.com/zeit/pkg
# please install it first with `npm install -g pkg`

: ${1?"Usage: $0 nodeVersion platform arch, where nodeVersion is e.g. 'node9'"}
: ${2?"Usage: $0 nodeVersion platform arch, where platform is 'freebsd', 'linux', 'macos', 'win'"}
: ${3?"Usage: $0 nodeVersion platform arch, where arch is 'x64', 'x86', 'armv6', 'armv7'"}

NODE_VERSION=$1 # nodeVersion node${n} or latest
PLATFORM=$2 # platform freebsd, linux, macos, win
ARCH=$3 # arch x64, x86, armv6, armv7

OUTPUT_DIR='../miner/binaries/'${PLATFORM}-${ARCH}
mkdir -p ${OUTPUT_DIR}
pkg --target ${NODE_VERSION}-${PLATFORM}-${ARCH} \
    --output ${OUTPUT_DIR}/sushipool-${PLATFORM}-${ARCH} \
    ../miner/index.js

# copy native codes
cp ../miner/node_modules/@nimiq/core/build/Release/nimiq_node.node ${OUTPUT_DIR}
cp ../miner/node_modules/node-lmdb/build/Release/node-lmdb.node ${OUTPUT_DIR}
if [ "$PLATFORM" = "macos" ]; then
    cp ../miner/node_modules/uws/uws_darwin_59.node ${OUTPUT_DIR}
elif [ "$PLATFORM" = "linux" ]; then
    cp ../miner/node_modules/uws/uws_linux_59.node ${OUTPUT_DIR}
elif [ "$PLATFORM" = "win" ]; then
    cp ../miner/node_modules/uws/uws_win32_59.node ${OUTPUT_DIR}
fi

cp ../miner/sushipool.conf ${OUTPUT_DIR}

echo
echo 'Successfully created:'
echo ${OUTPUT_DIR}/sushipool-${PLATFORM}-${ARCH}
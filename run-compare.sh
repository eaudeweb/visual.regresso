#!/usr/bin/env bash

node=$(which node)
if [ "$node" == "" ]; then
	echo "Cannot find node executable, exiting ..."
	exit -1
fi
DEBUG_LEVEL=INFO node index.js compare


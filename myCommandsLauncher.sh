#!/bin/bash

SCRIPT_DIR="$( realpath "$( dirname $0 )" )"

NPM="npm"

ARGS=()

while [ "$#" -gt "0" ]; do
    if [ "$1" == "update" ]; then
        ${NPM} update
    else
        ARGS+=("$1")
    fi
    shift
done


cd "${SCRIPT_DIR}"
$NPM start ${ARGS[@]}


#!/bin/bash

SCRIPT_DIR="$( dirname "$( realpath "$0" )" )"

electron ${SCRIPT_DIR}/resources/app.asar $@

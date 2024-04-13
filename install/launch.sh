#!/bin/bash

SCRIPT_DIR="$( realpath "$( dirname "$0" )" )"

electron ${SCRIPT_DIR}/resources/app.asar

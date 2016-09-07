#!/bin/bash
rm -rf docs
mkdir docs
jsdoc2md src/pond/*.js  --param-list-format list > docs/api.md

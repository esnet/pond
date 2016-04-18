#!/bin/bash
FILES=docs/*.doc
for f in $FILES
do
  base=$(basename "$f")
  name="${base%.*}"
  echo "Building docs for: $name"
  jsdoc2md src/$name.js  --param-list-format list --template $f > docs/$name.md

done


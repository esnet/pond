echo "> Start transpiling"
echo ""
rm -rf lib/* && ./node_modules/.bin/babel src --presets es2015 --plugins 'transform-runtime' src --out-dir ./lib
echo ""
echo "> Complete transpiling"
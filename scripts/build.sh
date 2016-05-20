echo "> Start transpiling"
echo ""
rm -rf lib/*
./node_modules/.bin/babel --version
echo ""
./node_modules/.bin/babel src --plugins 'transform-runtime' src --out-dir ./lib
echo ""
echo "> Complete transpiling"
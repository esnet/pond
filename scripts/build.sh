echo "> Start transpiling"
echo ""
rm -rf lib/*
./node_modules/.bin/babel --version
echo ""

./node_modules/.bin/babel src/pond/ --ignore __tests__ --plugins 'transform-runtime' --out-dir ./lib

echo ""
echo "> Complete transpiling"
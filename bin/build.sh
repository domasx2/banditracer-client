SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BASE_DIR="$(cd $SCRIPT_DIR && cd .. && pwd)"
echo $BASE_DIR
GAMEJS_REPO="git://github.com/domasx2/gamejs.git"
GAMEJS_HOME="$BASE_DIR/gamejs"
cd $SCRIPT_DIR && cd ..
echo 'compiling levels...'
node bin/compile_levels.js
if [ ! -d "./gamejs" ]; then
	git clone $GAMEJS_REPO
fi
echo "minifying gamejs..."
source gamejs/bin/build.sh
echo "copying gamejs.min.js to banditracer..."
cp gamejs/gamejs.min.js public/gamejs.min.js
echo "minifying banditracer..."
source gamejs/bin/minify-app.sh javascript/ compress


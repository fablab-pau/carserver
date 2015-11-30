#/bin/sh
BASEDIR=$(dirname $0)
cd $BASEDIR
git pull
npm start

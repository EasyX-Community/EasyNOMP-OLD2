#!/bin/bash

echo ""
echo "EasyNOMP Watching Logs..."
echo ""

source ~/.bashrc
source /etc/os-release

## who am i? ##
SCRIPTNAME="$(readlink -f ${BASH_SOURCE[0]})"
BASEDIR="$(dirname $SCRIPTNAME)"

## Okay, print it ##
echo "Script name : $SCRIPTNAME"
echo "Current working dir : $PWD"
echo "Script location path (dir) : $BASEDIR"
echo ""


if [ "${1}" != "" ]; then
  watch -n1 -- "sudo tail -n1000 ~/.pm2/logs/pool-out.log | grep -i -a \"${1}\"" ;
else
  ~/.nvm/versions/node/v8.1.4/bin/pm2 logs pool ;
fi


echo ""
echo "Done!"
echo ""

exit 0
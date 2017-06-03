#!/bin/bash -e -x

# Deploy the current build to a server

server=${1}

if [ "$server" == "" ]; then
  echo "Usage: $0 <server>   Deploy build (bin/) to <server>."
  exit 0
fi

if [ ! -d "bin/" ]; then
  echo "Missing build in bin/; re-run npm build-only"
  exit 1
fi

deployDate=$(date +"%m-%d-%Y_%Hh%Mm%Ss")
deployVersion=$(cat bin/version.html | tr -d '\n')
deployName="curator_v${deployVersion}_${deployDate}"

ln -s bin "${deployName}" && tar chvzf - "${deployName}" | ssh computeruser@${server} "cd archivist/web && tar xfvz - && ln -s -f ${deployName} curator"

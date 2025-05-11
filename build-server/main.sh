#!/bin/bash

if [ -z "$GIT_REPOSITORY__URL" ]; then
  echo "GIT_REPOSITORY__URL is not set"
  exit 1
fi

git clone "$GIT_REPOSITORY__URL" /home/app/output

exec node script.js
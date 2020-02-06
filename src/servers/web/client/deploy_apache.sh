#!/bin/sh

sudo echo Starting...
npm run build
sudo cp -r ./dist/client/* /var/www/html

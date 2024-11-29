#!/bin/bash

echo "Installing zubrick mediacontrol Dependencies"
#sudo apt-get update
# Install the required packages via apt-get
#sudo apt-get -y install

# If you need to differentiate install for armhf and i386 you can get the variable like this
#DPKG_ARCH=`dpkg --print-architecture`
# Then use it to differentiate your install
SCRIPT=$(realpath "$0")
current_dir=$(dirname "$SCRIPT")
cp $current_dir/70-teensy-hid.rules /etc/udev/rules.d/

#requred to end the plugin install
echo "plugininstallend"

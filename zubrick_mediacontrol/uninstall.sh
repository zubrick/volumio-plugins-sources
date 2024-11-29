#!/bin/bash

# Uninstall dependendencies
# apt-get remove -y

rm /etc/udev/rules.d/70-teensy-hid.rules

echo "Done"
echo "pluginuninstallend"

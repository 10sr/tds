#!/bin/sh

name=`basename "$PWD"`
cd .. && dev_appserver.py $name

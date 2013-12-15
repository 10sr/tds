#!/bin/sh

name=`basename "$PWD"`
cd .. && appcfg.py update $name

Tumblr Dashboard Slideshow (TDS)
================================

Slideshow the contents in your Tumblr dashboard.


Implementation
--------------

TDS can be diviced roughly into two parts: auth and show.


### Auth

The authorization part are all written in Python.
The main implementation is in `tds.py` and it uses a module `python-oauth`.


### Show

The slideshow part are mainly written in Javascript and located in `static/`
directory.

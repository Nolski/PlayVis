PlayVis
=======

PlayVis is a application for analyzing and visualizing character interactions in plays. We use Python with NLTK as our backend application for generating our json file and d3.js for visualizing our data.

Dependencies
------------
Please ensure that you have `enchant` and `nltk` installed on your system prior to running this application. 

To install these run:
`pip install enchant, nltk`

Instructions for Running
------------------------
To generate a json:
`python main.py path/to/play_file.txt`

This will populate a file called `output.txt` in the same directory. To then visualize this, copy `output.txt` into `vis/` and then load `vis/` onto an apache web server. 

Hit the webserver and load `index.html` to view the visualization. Simply replace output.txt with any other output from `main.py` to visualize other plays.

Demo
----

To view a visualization live visit: http://michael-nolan.com/playvis/midsummer/
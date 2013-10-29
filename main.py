import re as regex
import nltk
import linecache

class Character:
	def __init__(self, name, line, aliases=[]):
		self.name = name
		self.aliases = aliases
		self.line = line
		self.character_line = []
		self.aliases = []

	def get_sentiment():
		return 100

	#TODO
	def check_similar(self, name):
		self_name = self.name
		if len(name) > len(self.name):
			self.name = name
			self.aliases.append(self_name)
		else:
			

class PlayVis:
	def __init__(self, filename, outfile):
		self.filename = filename
		self.outfile = outfile
		self.format_paper()
		self.characters = []

	def format_paper(self):
		save = '';
		readfile = open(filename)
		outfile = open(self.outfile, 'w')

		character_line = False
		for line in readfile:
			# looks for the name
			matches = regex.search('^\s\s+[a-zA-Z]+\s?[a-zA-Z]+', line)
			# if it found a name
			if not matches == None: 
				# we are in a characters line
				character_line = True
			elif line[0] == ' ':
				character_line = False
			# if the length of line line is not less than 3 and 
			# we are in a character line
			if not len(line) < 3 and character_line:
				save += line # save the line
			else:
				character_line = False # we are not in a character line
				save += '************************************\n' # show that


		outfile.write(save)

	#TODO
	def find_characters():
		for line_num in self.character_line:
			line = linecache.getline(self.outfile, line_num);			
			
			

pv = PlayVis('texts/hamlet.txt', 'output.txt')
pv.find_characters();
import re as regex
import nltk

macbeth_file = open('texts/hamlet.txt')
out_file = open('output.txt', 'w')
save = '';


character_line = False
for line in macbeth_file:
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


out_file.write(save)


class Character:
	def __init__(self, name, line, aliases=[]):
		self.name = name
		self.aliases = aliases
		self.line = line

	def get_sentiment():
		return 100
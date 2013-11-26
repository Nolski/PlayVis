import re as regex
import nltk
import linecache
import enchant
from sets import Set
from string import punctuation


d = enchant.Dict("en_US")


class Character:

    def __init__(self, name, aliases=[]):
        self.name = name
        self.aliases = aliases
        self.lines = []
        self.aliases = Set()

    def get_sentiment():
        return 100


class PlayVis:

    def __init__(self, filename, outfile):
        self.filename = filename
        self.outfile = outfile
        self.characters = []
        self.character_lines = []
        self.names = {}
        self.format_paper()

    def format_paper(self):
        save = '';
        readfile = open(self.filename)
        outfile = open(self.outfile, 'w')

        character_line = False
        ii = 0

        #print self.__dict__
        for line in readfile:
            # looks for the name
            matches = regex.search('^\s\s[a-zA-Z]+\s?[a-zA-Z]+\.', line)
            # if it found a name
            if matches is not None:
                if not len(self.character_lines) == 0:
                    self.character_lines[-1]['end'] = ii
                self.character_lines.append({'begin': ii})
                # we are in a characters line
                character_line = True
            elif line == '':
                if character_line == True:
                    self.character_lines[-1]['end'] = ii
                character_line = False
            # if the length of line line is not less than 3 and 
            # we are in a character line
            if not len(line) < 3 and character_line:
                save += line # save the line
            else:
                tempLine = []
                tempString = ""
                tempString = line.translate(None,punctuation)
                tempString.lstrip()
                tempString = tempString.lower()
                tempLine = tempString.split()
                if len(tempLine) != 0:
                    if tempLine[0] == 'enter' or tempLine[0] == 're-enter':
                        for word in tempLine:
                            word = word.lower()
                            if d.check(word) != True:
                                if word not in self.names:
                                    self.characters.append(Character(word))
                                    self.names[word] = self.characters[-1]
                character_line = False # we are not in a character line
                save += '************************************\n' # show that
            ii += 1

        outfile.write(save)

    #TODO
    def find_characters(self):
        #print self.character_lines
        for line_num in self.character_lines:
            changed = False
            line = linecache.getline(self.filename, line_num['begin'] + 1);
            matches = regex.search('^\s\s[a-zA-Z]+\s?[a-zA-Z]+\.', line)
            name = matches.group()
            punct_replace = regex.compile('[%s]' % regex.escape(punctuation))
            name = punct_replace.sub('', name)
            name = name.strip()
            name = name.lower()
            for character in self.characters:
                if name == character.name[0: len(name)]:
                    character.aliases.add(name)
                    self.names[name] = character
                    character.lines.append(line_num['begin'])
                    changed = True
                    break
            if not changed:
                self.characters.append(Character(name))
                self.names[name] = self.characters[-1]
                self.characters[len(self.characters) -1].lines.append(line_num['begin'])

pv = PlayVis('texts/julius_ceasar.txt', 'output.txt')
pv.find_characters()
#print pv.character_lines
for character in pv.characters:
    print character.__dict__

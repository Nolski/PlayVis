import re as regex
import nltk
import linecache
import enchant
from sets import Set
from string import punctuation


d = enchant.Dict("en_US") #create english dictionary

sDict = {} # create dictionary of sentiment words
sent = open('sentiment.txt')
for line in sent:
    line = line.split()
    #print line
    key = line[0]
    value = int(line[-1])
    sDict[key] = value
#print sDict


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
        self.current_char = None
        self.last_char = None
        self.format_paper()

    def format_paper(self):
        save = ''
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
                oldLine = tempString.split()
                tempString = tempString.lower()
                tempLine = tempString.split()
                if len(tempLine) != 0:
                    if tempLine[0] == 'enter' or tempLine[0] == 're-enter':
                        for word in tempLine:
                            word = word.lower()
                            if d.check(word) != True or oldLine[tempLine.index(word)][0].isupper:
                                if word not in self.names:
                                    #print word
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
            line_num['last_char'] = self.current_char
            changed = False
            line = linecache.getline(self.filename, line_num['begin'] + 1)
            matches = regex.search('^\s\s[a-zA-Z]+\s?[a-zA-Z]+\.', line)
            name = matches.group()
            punct_replace = regex.compile('[%s]' % regex.escape(punctuation))
            name = punct_replace.sub('', name)
            name = name.strip()
            name = name.lower()
            for character in self.characters:
                if name == character.name[0: len(name)]:
                    if name == character.name:
                        character.lines.append(line_num['begin'])
                    character.aliases.add(name)
                    self.names[name] = character
                    character.lines.append(line_num['begin'])
                    changed = True
                    self.current_char = character
                    break
            if not changed:
                self.characters.append(Character(name))
                self.names[name] = self.characters[-1]
                self.characters[-1].lines.append(line_num['begin'])
                self.current_char = self.characters[-1]


    def sentiment_analysis(self):
        Sent = sDict
        lst = []
        #print self.character_lines
        #print len(self.character_lines)
        for line_group in self.character_lines:
            if 'end' not in line_group:
                line_group['end'] = line_group['begin']
            for line_num in range(line_group['begin'],line_group['end']): #get list of words for each line
                line = linecache.getline(self.filename, line_num + 1)
                line = line.strip()
                line = line.lower()
                line = line.translate(None,punctuation)
                lst = line.split()
                if lst != []:
                    if lst[0] in self.names:
                        lst.pop(0)
            total = 0
            for word in lst:
                if word in Sent:
                    total += Sent[word]
            
            #if total == 0: print lst, total
            line_group['sentiment'] = total
            
            

if __name__ == '__main__':

    pv = PlayVis('texts/hamlet.txt', 'output.txt')
    pv.find_characters()
    #print pv.character_lines
    #for character in pv.characters:
        #if character.lines:
           #print character.__dict__
    pv.sentiment_analysis()
    for line in pv.character_lines:
        print line['sentiment']

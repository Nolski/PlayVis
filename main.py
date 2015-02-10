import re as regex
import linecache
import enchant
import json
import sys
from sets import Set
from string import punctuation

# create English dictionary
d = enchant.Dict("en_US")

# create dictionary of sentiment words
sDict = {}
sent = open('sentiment/sentiment.txt')

for line in sent:
    line = line.split()
    # print line
    key = line[0]
    value = int(line[-1])
    sDict[key] = value

# create dictionary of sentiment words
sDict2 = {}
sent = open('sentiment/lsd.txt')
for line in sent:
    line = line.lower()
    line = line.translate(None, '*')
    line = line.split()
    if len(line) != 0:
        key = line[0]
        value = line[-1]
        sDict2[key] = value


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
        self.file_length = 0

    def format_paper(self):
        save = ''
        readfile = open(self.filename)
        outfile = open(self.outfile, 'w')

        character_line = False
        ii = 0
        fl = 0
        # print self.__dict__
        for line in readfile:
            fl += 1
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
                if character_line:
                    self.character_lines[-1]['end'] = ii
                character_line = False
            # if the length of line line is not less than 3 and
            # we are in a character line
            if not len(line) < 3 and character_line:
                # save the line
                save += line
            else:
                tempLine = []
                tempString = ""
                tempString = line.translate(None, punctuation)
                tempString.lstrip()
                oldLine = tempString.split()
                tempString = tempString.lower()
                tempLine = tempString.split()
                if len(tempLine) != 0:
                    if tempLine[0] == 'enter' or tempLine[0] == 're-enter':
                        for word in tempLine:
                            word = word.lower()
                            if (d.check(word) is not True or
                                    oldLine[tempLine.index(word)][0].isupper):
                                if word not in self.names:
                                    # print word
                                    self.characters.append(Character(word))
                                    self.names[word] = self.characters[-1]
                # we are not in a character line
                character_line = False
                # show that
                save += '************************************\n'
            ii += 1
        self.file_length = fl
        outfile.write(save)

    # TODO
    def find_characters(self):
        # print self.character_lines
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
            line_num['current_char'] = self.current_char.name

    def sentiment_analysis(self):
        Sent = sDict
        Sent2 = sDict2
        lst = []
        # print self.character_lines
        # print len(self.character_lines)
        for line_group in self.character_lines:
            if 'end' not in line_group:
                line_group['end'] = line_group['begin']
            # get list of words for each line
            for line_num in range(line_group['begin'], line_group['end']):
                line = linecache.getline(self.filename, line_num + 1)
                line = line.strip()
                line = line.lower()
                line = line.translate(None, punctuation)
                lst = line.split()
                if lst != []:
                    if lst[0] in self.names:
                        lst.pop(0)
            total = 0
            for word in lst:
                if word in Sent:
                    total += Sent[word]
                if word in Sent2:
                    total += int(Sent2[word])
            line_group['sentiment'] = total

    def to_json(self):
        data = []
        for ii in range(1, self.file_length + 1):
            # append all things that happend at line ii
            for line_group in self.character_lines:
                if line_group['begin'] == ii:
                    line_group['changed'] = True
                    if line_group['last_char'] is not None:
                        line_group['last_char'] = line_group['last_char'].name
                    data.append(line_group)
                    break
        data_string = json.dumps(data)
        out = open('output.json', 'w')
        out.write(data_string)

if __name__ == '__main__':
    if '-h' in sys.argv or '--help' in sys.argv:
        print 'To generate a json: \n \
                `python main.py path/to/play_file.txt`'
        sys.exit(0)
    pv = PlayVis(sys.argv[1], 'output.txt')
    pv.format_paper()
    pv.find_characters()
    pv.sentiment_analysis()
    pv.to_json()
    print 'characters: ', len(pv.characters)

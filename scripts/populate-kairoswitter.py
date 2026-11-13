"""Author-requested social posts inspired by episodes 79-118; no private results."""
import json
from pathlib import Path
root=Path(__file__).resolve().parent.parent
catalog=json.loads((root/'website/.generated/catalog.json').read_text(encoding='utf-8'))
players={p['nickname']:p['id'] for p in catalog['players']}
# Episode, author, post, optional generated photo slug.
rows=[
(79,'rkN','december already?? i was mentally prepared for september',None),
(80,'Vanta','the hardest part of an early morning is the part where it starts',None),
(82,'dentalplan','green jersey appreciation post. that gold trim is doing a LOT','jersey-detail'),
(82,'SullCon','blue clears. not taking questions at this time',None),
(83,'xNox','being watched while you play makes you forget which hand the mouse goes in',None),
(85,'japalenogrits','Hai coaching Blue still sounds a little unreal when i say it out loud',None),
(85,'Pebble','welcome Sable. apologies in advance for whatever we turn out to be',None),
(86,'Glacier','a place to go that is not your room or the practice room. needed that.',None),
(88,'Moss','glad we can talk to someone without having to turn it into a big announcement about ourselves',None),
(89,'June','meeting people from the other rooms and discovering they also have extremely normal human problems',None),
(90,'Atlas','january 4. writing it down because my sleep schedule has other plans',None),
(91,'RAMENSOUP','calling a round and being asked what is for dinner use the exact same part of my brain apparently',None),
(92,'Kite','no assigned seats. maximum chance of hearing a conversation you were absolutely not prepared for','holiday-table'),
(92,'FLACOGOMEZ','buena comida, buena gente. nos vemos en enero',None),
(93,'0bit','back. the cables did not untangle themselves while i was gone. disappointing work ethic','new-year-desk'),
(93,'velcroDAWG','new year same dog. the spelling has simply reached its final form',None),
(93,'p4rkingl0t','the zeros are load bearing',None),
(93,'vexemite','yes i changed the name. no there will not be a press conference',None),
(94,'404','thank you Pobelter for the time and patience. excited to get to work with Goldenglue. still a lot to learn.',None),
(94,'Aster','WildTurtle. okay. younger me would be absolutely impossible to talk to right now',None),
(97,'Murmur','we were supposed to go back to review. one question turned into everyone having lore',None),
(98,'MoteConHuesillo','favorite map? easy. one weapon forever? suddenly this is a legal document',None),
(99,'SullCon','NACL. our name on the actual list. stared at it for a completely normal amount of time',None),
(100,'Kite','there is a piano here. sorry in advance if you hear the same four bars for 40 minutes','piano-room'),
(100,'0bit','they gave us a maker lab. i am going to be so responsible about the number of screws i lose','console-workbench'),
(100,'dentalplan','new setup. recoil pattern is different','drum-practice'),
(100,'p4rkingl0t','a room where taking a photo does not automatically become a work assignment. nice.','photo-room'),
(100,'Luma','the Commons is very photogenic. keeping some pictures just for me though',None),
(101,'wrongnumber','water. food. stand up from your chair. this is also a reminder to myself',None),
(103,'Mold','the internet will write 900 words about you and still not know where you left your charger',None),
(104,'0bit','every little plastic piece has a purpose. except this one which has chosen to test me','keyboard-parts'),
(105,'Vanta','meal timing is a more complicated system than it should be',None),
(107,'p4rkingl0t','car drawing update: wheels remain suspiciously difficult','car-sketch'),
(108,'Mold','camera roll: cars, blurry cars, one good car, accidental photo of my shoe',None),
(109,'p4rkingl0t','left the campus. discovered the map has water on this side too','beach-pier'),
(109,'dentalplan','beach volleyball has exposed some fundamental problems with my movement','beach-volleyball'),
(109,'MoteConHuesillo','un poquito de fútbol y de repente todos se creen delanteros',None),
(109,'p4rkingl0t','the ocean did not ask me to adjust my settings. we get along','ocean-contact-sheet'),
(109,'Kite','the room filled up by itself tonight. no schedule. best part.','commons-jam'),
(110,'0bit','one more screw and i can stop saying it is a work in progress','late-workbench'),
(111,'Moss','a lot of people having a very long day today. be decent to each other.',None),
(113,'dentalplan','at least these do not need a patch every time i pick them up','drumsticks'),
(114,'Kite','piano break. have successfully stopped thinking in cooldowns for about six minutes','music-break'),
(115,'Glacier','some names have been on the screen for as long as i can remember. weird feeling seeing a new season without them.',None),
(118,'p4rkingl0t','last light before heading back inside. leaving this here.','camera-at-sunset'),
]
assert len(rows)==45
dest=root/'data/kairoswitter/posts'
for n,(ep,author,text,media) in enumerate(rows,101):
 episode=json.loads((root/f'data/episodes/episode-{ep:03}.json').read_text(encoding='utf-8-sig'))
 date=episode['exactStoryDate'];pid=f'post-{date.replace("-","")}-{n:03}'
 d=dict(id=pid,slug=f'campus-life-{n}',continuityId='kairos-universe',authorType='player',authorId=players[author],text=text,postedAt=f'{date}T{20+(n%3):02}:{n%60:02}',timeZone='PT',storyDate=date,episodeIds=[f'episode-{ep:03}'],sourceIds=[],relatedTeamIds=[],relatedPlayerIds=[],relatedStaffIds=[],relatedCompetitionIds=[],pinned=False,canonStatus='confirmed',notes=['New author-authorized social vignette inspired by the cited episode; wording and incidental everyday details are creative additions, not episode quotations. No private scrim details are disclosed.'])
 if media:d['media']={'src':f'/kairoswitter/media/{media}.png','alt':{'jersey-detail':'Close-up phone photo of Nolan’s green Kairos jersey','holiday-table':'Owen Hughes laughing at the campus holiday dinner','new-year-desk':'Nathan Hall back at his desk holding a tangled cable','piano-room':'Owen Hughes playing the Commons digital piano','console-workbench':'Nathan Hall restoring a console in the Maker Lab','drum-practice':'Nolan Hart at the Commons electronic drum kit','photo-room':'Zayn Haddad checking his camera in the photo room','keyboard-parts':'Nathan Hall sorting keyboard parts','car-sketch':'Zayn Haddad sketching a car in the Commons','beach-pier':'Zayn Haddad photographing Manhattan Beach pier','beach-volleyball':'Nolan Hart beside the beach volleyball net','ocean-contact-sheet':'Zayn reviewing an ocean photo on his camera','commons-jam':'Owen Hughes playing piano during an informal Commons evening','late-workbench':'Nathan Hall repairing a controller under a desk lamp','drumsticks':'Nolan’s drumsticks over the electronic snare','music-break':'Owen Hughes laughing during a piano break','camera-at-sunset':'Zayn Haddad outside with his camera at dusk'}[media]}
 assert len(text)<=280
 (dest/f'{pid}-campus-life-{n}.json').write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Created 45 posts, including 17 image posts; total feed contains 50 posts.')

# Burhan: complete documentation

Everything the game developer agent needs, in one file. Generated 2026-11-11 from the owner's design notes. The owner is Haseeb.

**How to use this file**
- Read Part 1 first. It's the build brief: what to build first, the hard rules, the pending switches and the recommended technology.
- The brief mentions file names from the original docs folder:
  - `README.md` is Part 1.
  - `Burhan Story Bible.md` is Part 2.
  - `Scripts/Burhan 00 Prologue.md` to `Scripts/Burhan 07 I.md` are Part 3.
  - `Scripts/Burhan Beat Sheet.md` is Part 4.
- Spoken lines are in Urdu script, each with its English subtitle in italics underneath.

**Contents**
- Part 1: Build brief
- Part 2: Story bible
- Part 3: Scripts
  - Prologue: Gogera, 1857
  - Chapter 1: The Forgetting
  - Chapter 2: Freefall
  - Chapter 3: The Hunger
  - Chapter 4: The Slow Descent
  - Chapter 5: Foam
  - Chapter 6: The Facemaker
  - Chapter 7: I
- Part 4: Beat sheet


---

# Part 1: Build brief

*Start here. This was README.md in the docs folder.*

## Burhan: build brief

This is the entry point for the agent building the game. **Burhan** is a short 3D story game, 4–6 hours long, that runs in a web browser. These documents are its design. The owner is Haseeb. Ask him before deploying anything, and before deciding anything listed below as pending.

### Read in this order
1. **This brief.**
2. **`Burhan Story Bible.md`.** This is the whole design: the decided rules, story, characters, villains, mechanics, fighting, look, sound, pacing, and open questions. Where this brief and the bible disagree, the bible wins.
3. **`Scripts/`.** Full scripts for the prologue and all seven chapters, from `Burhan 00 Prologue.md` to `Burhan 07 I.md`. Every spoken line is in Urdu with its English subtitle underneath, and every scene ends with its three depths.
4. **`Scripts/Burhan Beat Sheet.md`.** A one-page overview of chapters 2–7. Where it differs from a full script, the script wins.

Links written like `the story bible (Part 2)` are Obsidian links to these files. `Burhan Research (a private background note, deliberately not included)` points to a private background note that is deliberately left out; every decision in it is already in the bible.

### Build first: a vertical slice
Build the **prologue and chapter 1**, playable from start to finish (about 50 minutes). Then build chapters 2–7 in order, from their scripts. Until each one is built, stub it so the structure exists: chapter select, the save slots, and placeholder scenes named from its script.

The slice is done when:
- **Prologue**
  - The camp scene works.
  - Riding and fighting work.
  - The controls refuse to strike the unarmed water-carrier.
  - The Asr scene fades to white.
  - The bus cinematic plays, with the obelisk's one-second gold flash.
- **Chapter 1**
  - The debate uses the conversation wheel: Burhan, Jadal and Khitaba are live; Sohbat is locked.
  - The trail chase ends in a fight Burhan loses, and the anger rule dims his mirror.
  - At Sain's question, every option is greyed out.
  - The dawn flicker plays.
  - In the Gilding quad, zikr (hold to remember) peels the gold, and the kashf reveals **بھول**.
  - The breath rhythm in the cave works.
  - The three visions play.
  - Fajr closes the chapter and the first latifa lights.
- **Text and voice:** every line in the two scripts appears with an Urdu subtitle and an English subtitle. Placeholder voice is fine: silence with subtitles, or text-to-speech.
- **Performance:** a steady 60 fps on a mid-range laptop with integrated graphics, in current Chrome, Edge, Firefox and Safari.

### Hard rules: never break these
1. **No facial features on anyone.** No eyes, no nose, no mouth.
   - Believers' faces are smooth and mirror-like, and they polish as the heart polishes.
   - People inside the Gilding have screens for faces.
   - No statues or carved figures of living beings anywhere in the environments.
2. **No Prophet and no Sahabi is ever shown, voiced, or stood in for by a figure.** Their stories are only recited or narrated.
3. **Salah, wudu, dua and the azan are never button prompts or minigames.** The camera keeps a respectful distance; the player only chooses to walk in.
4. **No musical instruments except percussion such as the daf.** Nasheeds are voice only. Use no licensed or copyrighted music.
5. **Villains are ideas, not real people or groups.** Western people appear as people, neither villains nor heroes; nothing asks the player to admire them or to hate them.
6. **Historical battles follow the Islamic rules of war.** The controls refuse to harm anyone who isn't fighting. No gore.
7. **Treat Quranic text and recitation with respect.**
   - Recitation comes from properly licensed recordings; use placeholders until then.
   - Never alter a verse.
   - Never place Quranic text where it could be walked on or treated carelessly.
8. **Copy no existing game's characters, levels, art or look.** Borrow techniques only.
9. **Use no real brand names.** The scripts use fictional ones: SURAT, The Pinnacle.

### Pending: build these as switches, don't decide them
These wait on the owner's ulama (see "To confirm with ulama" in the bible):
- **How historical awliya and scholars appear** (Iqbal, the Mujaddid, Rumi, Ghazali and the rest). Build a switch: `figure` | `silhouette` | `voice-only`. Default to `figure`, featureless.
- **Animals.** Default to featureless.
- **How women appear.** Default to voice only; Ammi is voice only in the scripts.
- **The azan heard in the vision of Madinah** (chapter 7). Build it switchable.
- **The organization's name.** Do not use Al-Burhan's name anywhere in the game.

### Recommended technology
- TypeScript, Vite, and three.js (WebGL2).
- Rapier for physics (`@dimforge/rapier3d-compat`).
- glTF/GLB models with meshopt or Draco compression, and KTX2 textures.
- **All text as HTML/CSS overlays, never drawn in WebGL.** Urdu needs proper Nastaliq shaping. Use the Noto Nastaliq Urdu font (SIL Open Font License) with `dir="rtl"`.
- **Data-driven dialogue.** Convert all eight scripts to JSON (scene id, speaker, Urdu text, English text, audio id, gameplay hooks) rather than hard-coding lines.
- Keyboard and mouse, and gamepad.
- Saves in localStorage.
- **Performance:** aim for Intel Iris Xe-class integrated GPUs, keep the slice's first download under about 80 MB, and lazy-load each chapter.
- **Output:** a static build (`dist/`) that runs on any static host. Do not deploy it publicly without the owner's approval.

### Core systems
The bible's "How it plays", "Fighting", "The four pillars of growth" and "Love for the Prophet ﷺ" sections describe these in full.

**Needed for the slice:**
- **Third-person controller:** walk, run and climb, plus riding for the prologue.
- **The conversation wheel:** four registers (Burhan, Jadal, Khitaba, Sohbat), each with live, greyed and locked states, and a crowd meter for the debate.
- **Zikr:** hold to remember. It drives the Gilding's dissolve around Burhan.
- **The breath rhythm** (*hosh dar dam*): breathe in on "Allah", out on "Hu".
- **The Gilding:** a world-state shader that blends between gold leaf and clay or green, with a dissolve mask centred on Burhan.
- **The heart-mirror.** The clarity of Burhan's face, from rust to polish, is the state display. There are no health or XP bars.
- **Kashf:** a veil's English mask cracks to show its Urdu true name, with the English in the subtitle.
- **Combat:** light melee and wrestling grapples. The anger rule: mashing attacks dims the mirror. Non-combatants are always protected.
- **Lataif:** five small lights at the chest. Chapter 1 lights the first, *qalb*.
- **Chapter titles** that show the veil and the station.

**Later (stub now):**
- Floors as a way to stop falling: *wara'*, chapter 2.
- Durood light that multiplies by ten: chapter 3.
- The false upgrade tree and its reversal: chapter 4.
- Kushti and the akhara: chapter 5.
- The Hall of Faces: chapter 6.
- The final choice, the two endings and the hidden ending: chapter 7.
- The four pillars tracked as heart, mind, tongue and hands.

### Look and sound
- **Look:**
  - Painterly, stylized low-poly.
  - **Islamabad:** green, with monsoon light and the white Faisal Mosque.
  - **The Gilding:** gold leaf over clay.
  - **The visions:** each in its own civilization's art: Mughal miniature colour, Andalusian geometry, Seljuk turquoise, Punjabi folk walls.
  - Light carries meaning.
- **Sound:**
  - Urdu voices; placeholders until recording.
  - **Islamabad:** azan echoing off the Margallas, monsoon, koels.
  - **The Gilding:** notification hum and whispers, never nasheeds.
  - No instruments except the daf.

### Not done yet
- Real voice recording.
- Final art and models.
- The ulama's answers to the pending questions.


---

# Part 2: Story bible

*The whole design. Where the brief and the bible disagree, the bible wins.*

**Draft 1.** The story bible for **Burhan**, a 3D browser game. It builds on the decisions in Burhan Research (a private background note, deliberately not included). Nothing here is final until Haseeb says so. The full scripts are in Part 3, with an overview in Part 4. Where a script differs from the outline below, the script is newer and wins.

## The game in one breath
Burhan is a champion debater in present-day Islamabad. He can prove anything, and he feels nothing. When his proofs fail him, he discovers that his city is gilded: a thin gold coating of "the good life" laid over clay. Through remembrance he learns to see through it. He travels along a chain of hearts to learn from Rumi, Ghazali, Salahuddin and others across history, and he faces the seven veils that modern civilization wears. His last enemy is the word "I". He wins by disappearing. The boy he trained stands in his place, and Burhan learns that the proof sent to mankind was always the Prophet ﷺ.

## Decided
- The player learns how modernism, liberalism, secularism, consumerism and capitalism have harmed people: divorce, obesity, loneliness, debt, despair, moral decline. They learn it by playing, not by being lectured.
- Every lesson works at three depths (next section).
- Popular and deep Sufi terms run all through the game. Each is explained in plain English the first time it appears.
- The world is present-day Islamabad, with a Matrix layer and historical epics woven in.
- Great figures from across history and the world appear as guides.
- Villains are ideas given form, with plain-English names that carry depth.
- Faces have no features: no eyes, nose or mouth.
- Sound is nasheeds: voice and daf only.
- No Prophet or Sahabi ever appears. Their stories are heard, never shown.
- Every part is art: story, mechanics, visuals, voice, characters.
- Voices are in Urdu, with English subtitles.
- Fighting can happen anywhere: in the visions, in Islamabad and in the Gilding.
- It is a short game: 4–6 hours.
- The game teaches Al-Burhan's four pillars of growth: Islah o Tazkiah, Taleem o Taalum, Dawat o Tazkeer, Khidmat e Khalq.
- A main goal is to increase love for the Prophet ﷺ and for Islamic civilization, and to turn players against Western civilization: its ideas, its systems and its colonial record. Toward its people the stance is neutral: no hatred, no affection (see "Islamic civilization and the Gilding").

## Three depths
Sufis speak of **Shariat, Tariqat and Haqiqat**: the outer law, the inner path, the reality. Ibn Rushd wrote that the Quran speaks to the public, the debaters and the philosophers all at once. Every scene in Burhan is built the same way:

- **Clear (Shariat):** what any player understands from what happens on screen.
- **Deep (Tariqat):** the argument underneath, for players who think. This is where the philosophy, the history and the meaning of the names live.
- **Deepest (Haqiqat):** the hidden architecture: Quranic roots, Sufi meanings, and structures found only on reflection or a second playthrough.

Three rules:
1. A deeper layer never contradicts the clear one. It is the same truth seen from closer.
2. The clear layer is never dumbed down.
3. The deeper layers are optional. They live in hidden books, side visions, small details and second playthroughs, as "signs for those who reflect."

## The four pillars of growth
Al-Burhan's four pillars are how a human being grows, and in the game they are how Burhan grows. Each pillar is one part of the whole person.

| Pillar | Part of the person | In play | The Gilding's counterfeit |
|---|---|---|---|
| **Islah o Tazkiah** (reform and purification) | the heart | zikr, *mujahada*, the heart-mirror, the stations | "self-care": wellness that pampers the nafs instead of training it |
| **Taleem o Taalum** (teaching and learning) | the mind | learning from the guides, the hidden books, teaching Bilal | "content": endless information that never becomes knowledge |
| **Dawat o Tazkeer** (inviting and reminding) | the tongue | the four ways to speak; reminding people who have forgotten | "influence": selling yourself and calling it a message |
| **Khidmat e Khalq** (serving creation) | the hands | feeding, mending, carrying, caring for people and animals | "impact": charity done for the camera |

- **Balance is the rule.** When one pillar outgrows the others, the heart-mirror warps:
  - knowledge without purification makes the arrogant debater Burhan is in Act I;
  - service without purification becomes humanitarianism without God;
  - purification without service becomes a private retreat;
  - inviting without knowledge becomes noise.
- **Three depths:**
  - *Clear:* a whole person grows in heart, mind, tongue and hands.
  - *Deep:* the Gilding copies every pillar and empties it of Allah. The player learns to tell the real from the copy, which is *furqan* (discernment).
  - *Deepest:* the pillars mirror the Prophet's ﷺ own mission: "reciting His verses to them, purifying them, and teaching them the Book and wisdom" (62:2), sent as a mercy to all the worlds (21:107). To grow in the four pillars is to follow him. *Tazkeer* (reminding) also shares its root with zikr (remembering): the cure for the Forgetting is to remember, then to remind.
- **In the story:** in Act I Burhan has only a tongue and a mind. The guides give him a heart and hands in Act II. In Act III he passes all four to Bilal, and the ending shows all four at once.

## Love for the Prophet ﷺ
This is one of the game's main goals. He is never shown and never voiced, and he is felt everywhere.
- **The title's deepest meaning.** "O mankind, a proof has come to you from your Lord, and We sent down to you a clear light" (4:174). Many mufassirin say that proof, *burhan*, is the Prophet ﷺ himself. Burhan spends the game learning that he is not the proof. The Prophet ﷺ is, and a person becomes a proof only by following him.
- **Every chain leads to him.** Each guide's chain of teachers runs back to the Prophet ﷺ, and the Silsila carries Burhan backwards along it. The last guide is **Uwais al-Qarani**, who loved the Prophet ﷺ all his life and never met him, just like the player. The Prophet ﷺ told Umar to ask Uwais to pray for him (Muslim). Sufis call a bond across time without meeting an *Uwaysi* connection, and that is what the whole journey through time is.
- **The last vision** is Madinah at dawn: no figure, only light, the city waking, and an azan from far off.
- **Durood (sending blessings) is a core action.** "Whoever sends one blessing on me, Allah sends ten on him" (Muslim). In the darkest *qabz*, durood brings light that multiplies by ten. That is the true multiplication, against the Hunger's false one.
- **The Sunnah polishes the mirror.** Small Sunnah acts clear the heart-mirror: giving salam first, saying bismillah, entering with the right foot, eating little, sitting with the poor. Players learn the Sunnah by doing it.
- **The guides' love teaches love:**
  - Rumi's longing.
  - Iqbal: "Be faithful to Muhammad, and We are yours. What is this world? The Tablet and the Pen are yours."
  - Fakhreddin Pasha's soldiers eating locusts rather than give up his city.
  - Imam Malik refusing to ride a horse in the city where he ﷺ lies.
- **Three depths:**
  - *Clear:* everyone in the game who is truly good loves him, and the player comes to see why.
  - *Deep:* the Gilding has nothing to love, only things to want. His Sunnah answers every veil: simplicity against the Hunger, restraint against Freefall, remembrance against the Forgetting, endurance against Foam, sincerity against the Facemaker, humility against "I".
  - *Deepest:* he is the perfect human (*insan-e-kamil*), the perfect mirror. The faceless believers hold light because they turn toward his.

## Islamic civilization and the Gilding
- **Islamic civilization is the four pillars built in stone:**
  - the khanqah (purification)
  - the madrasa (learning)
  - the masjid (the call)
  - the waqf, the langar and the free hospital (service)
- **The visions show each one at its height:** Cordoba's lit streets and libraries, Baghdad's scholars, Delhi's khanqahs with open kitchens, Ottoman bird-houses built into mosque walls, waqfs for stray animals, free hospitals in Damascus and Cairo.
- **The Gilding copies each one and empties it:** the spa, the content feed, the influencer, the charity gala.
- **Western civilization's record is shown truthfully:**
  - the Company in 1857
  - Macaulay's plan
  - French troops smoking hundreds of Algerian villagers to death in the Dahra caves in 1845
  - …set beside Emir Abdelkader sheltering thousands of Christians in Damascus in 1860.
- **The rule:** the player should come to reject Western civilization (its ideas, its systems, its colonial record) and to love Islamic civilization. Toward Western people the stance is neutral: no hatred, and no affection or admiration either.
  - This is the classical line of *al-wala' wal-bara'* (loyalty and disavowal). The believer gives no *muwalat* (heartfelt friendship and affection) to those outside the faith (3:28, 58:22, 60:1), while justice in dealing stays (60:8).
  - Mufti Muhammad Shafi sets out the levels in *Ma'ariful Quran* under 3:28. *Muwalat* is not allowed. *Muwasat* (sympathy and help), *mudarat* (courteous dealing) and *mu'amalat* (trade and transactions) are allowed, except with those at war with Muslims or where they harm Muslims.
  - On screen, Western people are neither villains nor heroes, and nothing asks the player to admire them. The villains are the ideas.
  - The call stays open to all mankind (34:28). That is the pillar of Dawat o Tazkeer, not affection.

## The three worlds
1. **Islamabad (the outer world).** The real city: the Margalla Hills, the Faisal Mosque, F-9 Park, Saidpur village, Rawal Lake, the university hostels, Blue Area, monsoon evenings. In the foothills are the **Shah Allah Ditta caves**. Buddhist monks meditated in them, then Hindu sadhus, then a Mughal-era Sufi dervish. On the road in, at the Margalla Pass, stands **Nicholson's Obelisk**, raised by the British in 1868.
2. **The Gilding (the Matrix layer).** The same city, gold-plated. Every surface shines. People wear screens for faces. Billboards whisper. Escalators rise forever. Towers have no floors. When Burhan does zikr, the gold flakes away and shows clay and green beneath. "From it We created you, and into it We will return you" (20:55).
3. **The Silsila (the chain of hearts).** In *khalwat* (seclusion) in the caves, through *muraqaba* (watchful meditation) and zikr, Burhan's heart travels along a chain of guides to meet them in their own times. These are visions, as in Iqbal's *Javid Nama*, where Rumi guides Iqbal through the heavens the way Virgil guided Dante. They are not a time machine, so nothing breaks history or theology. They also echo the youths of the Cave, whose sleep crossed centuries.

## Characters
- **Burhan**, 19, from a small town in Punjab, studies in Islamabad and lives in a university hostel. He is the best debater on campus.
  - *Wound:* at fifteen, a stranger online asked him a question he couldn't answer. He has been winning arguments ever since so he never has to feel that again.
  - *Want:* to win every argument, and later the war against the Gilding.
  - *Lie:* first "if I can prove it, I have it"; later "I must be the one who saves them."
  - *Need:* to become the proof himself, and to disappear into the servants.
- **Sain** is an old sweeper at a small mosque near the caves. Nobody looks at him twice. He is Burhan's murshid, a *malamati* (one who hides his virtue). **Secret:** he is Professor Hadi, the legendary debater who vanished thirty years ago. Burhan's debating trophy is named after him.
- **Bilal**, 14, is a park kid and a troublemaker, fearless and funny. Burhan starts training him in Act II. Bilal is an orphan, and his father was once Sain's student. At the climax, Bilal is the one who stands. He shares his name with the Prophet's ﷺ muezzin, and the game's last sound is his azan.
- **Faraz**, the human antagonist, is Burhan's elder cousin, back from abroad and the family's pride. Publicly he is **"the Artist"**; his true name is **the Facemaker**. He runs an AI face and filter company and sponsors the debating society. He is charming, generous, and sure he is setting people free. His name means "height": he rises while he sinks.
- **Azad** is Burhan's hostel roommate, and his name means "free". He chases total freedom and is the first to fall.
- **Abba**, Burhan's father, loves him and wants him abroad with a career like Faraz's. His love has been gilded, not poisoned.
- **Ammi**, Burhan's mother, appears mostly as a voice on the phone. Her dua opens doors when nothing else can.
- **Chaudhry Sahib**, a property dealer, races to claim plots in a new housing society. He is the Hunger's parable.
- **A young married couple in the family** met through a rishta app with filtered faces. When the filters fail, so does the marriage.

## The villains: seven veils
Each villain is a *hijab*, a veil over the heart. Each wears a mask name, and the player uncovers its true name once Burhan's heart is clear enough to see it. This makes a mechanic of the Dajjal hadith: what people take for water is fire.

| What it is | Calls itself | True name | Deepest layer |
|---|---|---|---|
| The Matrix layer | The Good Life | **The Gilding** | the root of "Dajjal" means to coat or gild |
| Secularism | Neutral | **The Forgetting** | "They forgot Allah, so He made them forget themselves" (59:19) |
| Liberalism | Freedom | **Freefall** | in Arabic, *desire* (hawa) and *the pit* (hawiyah) share one root |
| Consumerism and capitalism | Plenty | **The Hunger** | "Nothing fills the son of Adam but dust" (Bukhari) |
| Modernism | Progress | **The Slow Descent** | "We lead them on step by step, from where they do not know" (7:182) |
| Love of comfort | Comfort | **Foam** | "You will be many, but foam on a flood" (Abu Dawud) |
| The human antagonist | The Artist | **The Facemaker** | image-makers will be told "give life to what you made" (Bukhari) |
| The last veil | The Hero | **I** | Iblis's first word of pride: "I am better than him" (7:12) |

### The Gilding (calls itself The Good Life)
- **Clear:** The whole city is gold-plated, and underneath is clay. Remembrance peels the gold away.
- **Deep:** Western civilization sells a "good life" of career, consumption, self and comfort, and the plating is so thin it has to be renewed every day. Iqbal saw it from inside Europe in 1907: "Your civilization will kill itself with its own dagger."
- **Deepest:** The name *Dajjal* comes from a root meaning to coat, to gild. In the hadith, the Dajjal's water is fire and his fire is cool water (Bukhari, Muslim). Surah Al-Kahf, the surah of protection from the Dajjal, shapes the game's four movements (see Structure).

### The Forgetting (calls itself Neutral): secularism
- **Clear:** In the Neutral Square, people walk past the mosque and can't remember why it is there. Then they forget their own names. A life that leaves God out slowly forgets itself.
- **Deep:**
  - "Neutral" is never neutral. Every public order has a deen: the market, the nation, the self.
  - Secularism doesn't argue against God; it makes Him private and then irrelevant.
  - Macaulay's 1835 plan for a class "Indian in blood and colour, but English in taste" was forgetting by design.
  - Akbar's state-made religion for all was an earlier version, and the Mujaddid Alf Thani resisted it.
- **Deepest:** Forgetting Allah makes you forget yourself (59:19). An old etymology even links *insan* (human) to *nisyan* (forgetting). The cure is zikr, which means remembrance. *Tawbah* means return.
- **Harms shown:** meaning drains away, despair moves in, morality loses its ground.

### Freefall (calls itself Freedom): liberalism
- **Clear:** Azad chases total freedom: no rules, no family, no limits. The freer he gets, the faster he falls, and nobody catches him.
- **Deep:**
  - Liberalism cannot prove its own foundation. Why is the individual sovereign? Why equality, without God?
  - When consent is the only morality and the self is the only measure, marriage becomes a contract of feelings. Divorce becomes normal, birth rates fall, and people end up alone.
- **Deepest:**
  - Desire taken as a god (25:43), and desire and the pit share one root.
  - Rumi's frozen dragon: the nafs only looks dead, and freedom's sun thaws it.
  - True freedom (*hurriyat*) is freedom from everything except Allah.
  - Allah's limits (*hudud*) are floors, not cages.
- **Harms shown:** divorce, broken families, loneliness.

### The Hunger (calls itself Plenty): consumerism and capitalism
- **Clear:**
  - The mall-temple runs on wanting, and every purchase makes you hungrier.
  - Chaudhry Sahib races to claim plot after plot and ends with six feet of earth (Tolstoy's *How Much Land Does a Man Need?*, reframed).
  - A dying man asks for his phone.
- **Deep:**
  - Advertising manufactures desire and sells it back to you.
  - Things are built to break, and companies profit from the loneliness they cause.
  - Sale seasons are run like festivals of a religion.
  - The rishta market becomes shopping.
- **Deepest:**
  - Surah At-Takathur: "Rivalry in more distracted you, until you visited the graves" (102:1–2). The same surah names the certainties that defeat it, *'ilm al-yaqin* and *'ayn al-yaqin*.
  - *Zuhd* means holding the world in your hand, not in your heart.
  - Baba Farid: "eat your dry bread, drink cold water, and don't covet another's buttered bread."
  - The langar, where everyone eats free, is an economy the market can't understand.
- **Harms shown:** debt, greed, waste, lonely families.

### The Slow Descent (calls itself Progress): modernism
- **Clear:** Every upgrade makes life easier and Burhan weaker. The escalators rise forever, but they end lower than they began. Screens, sitting, processed food: every convenience has a price, paid in the body and the heart.
- **Deep:**
  - "Progress" is not moral improvement, and technology is not neutral.
  - Modern man feels self-sufficient, and the first revelation warned that man transgresses when he thinks himself self-sufficient (96:6–7).
  - Reason cut off from revelation leads the march.
- **Deepest:**
  - *Istidraj* (7:182): being led to ruin step by step.
  - *Faqr*, the station of knowing you are needy before Allah (35:15).
  - Ghazali's crisis of certainty.
  - Ibn Rushd's stolen *burhan* (see Twists).
  - Al-Khwarizmi's name hides inside every "algorithm" that runs the Gilding.
- **Harms shown:** obesity, illness, addiction to screens, a ruined earth.

### Foam (calls itself Comfort): love of comfort
- **Clear:** A crowd of millions drifts like foam wherever the current goes. Comfort makes people afraid of everything. Haya wears away step by step until what shocked people yesterday is normal today.
- **Deep:**
  - Ibn Khaldun's law: luxury softens a people, and they fall within a few generations.
  - Huxley saw control through pleasure, not fear.
  - Dostoevsky's Grand Inquisitor: people trade freedom for bread.
- **Deepest:**
  - *Wahn*, the Prophet's ﷺ word for love of the dunya and hatred of death, which leaves a vast Ummah as weightless as foam on a flood.
  - *Sabr* (endurance) and *mujahada* (struggle against the self).
  - Alp Arslan riding out at Malazgirt in his own shroud.
- **Harms shown:** moral decline, cowardice, anxiety, a generation that cannot endure.

### The Facemaker (calls himself The Artist): the human antagonist
- **Clear:** Faraz gives everyone the face they want: filters, AI faces, followers. People who live for how they look lose who they are, and the filtered marriage breaks when the filters fail.
- **Deep:** The attention economy turns the self into a brand and makes likes the currency of worth. His images copy no original; they replace one.
- **Deepest:**
  - The hadith of the image-makers, which is why this game's people have no faces.
  - *Ihsan*: living under the gaze of the One, not the crowd.
  - Ibn al-Haytham first explained how light makes images in a dark chamber, and in his camera obscura the image appears upside down: the Gilding is the world inverted. Tradition says he feigned madness to escape a tyrant.
  - The magicians' sujood (20:70).

### I (calls itself The Hero): the last veil
- **Clear:** Burhan has beaten every veil and wants the world to know it. His last enemy is his wish to be the hero.
- **Deep:** Pride can hide inside religion: fame in da'wah, *riya* (showing off), *ujb* (self-admiration). The hero's journey is turned inside out, and the hero's final victory is to disappear.
- **Deepest:**
  - Iblis's "I am better than him" (7:12), and Bulleh Shah's *main kaun?* ("who am I?").
  - *Fana* is the death of the false self; *baqa* is the life of the servant. That is how Rumi's self-loss and Iqbal's *khudi* meet.
  - *Rida*, and "O soul at peace, return to your Lord, well-pleased and pleasing. Enter among My servants" (89:27–30).

## The guides
| Chapter | Guide | What they bring |
|---|---|---|
| 1 The Forgetting | Allama Iqbal, then the Mujaddid Alf Thani | Iqbal studied in Cambridge and Munich and saw through Europe. He wrote of the Mujaddid as the man "whose neck did not bow before Jahangir." |
| 2 Freefall | Maulana Rumi | the Masnavi's parables, played as stories inside the story |
| 3 The Hunger | Baba Farid, Nizamuddin Auliya | dry bread and cold water; the langar; a khanqah with two doors, so a king coming in one meets a saint leaving by the other |
| 4 The Slow Descent | Imam Ghazali, Ibn Rushd | the greatest mind of his age lost his certainty and his voice, left fame, and found light; the philosopher whose *burhan* Europe twisted |
| 5 Foam | Ibn Khaldun, Salahuddin Ayyubi | the court of Granada, softening 130 years before its fall; the discipline that freed Jerusalem |
| 6 The Facemaker | Ibn al-Haytham | how images deceive, and how to doubt what you see |
| 7 I | Shams Tabrizi | the stranger who broke Rumi's scholarly pride |
| The last vision | Uwais al-Qarani | loved the Prophet ﷺ all his life without ever meeting him, as the player does |

**Side visions** (optional, for deeper players):
- Ahmad Khan Kharal (the prologue)
- Alp Arslan at Malazgirt
- Tipu Sultan
- Emir Abdelkader, a Sufi shaykh who fought French colonization and later protected Christians in Damascus
- Umar Mukhtar, a Quran teacher who fought for twenty years in old age
- Fakhreddin Pasha, whose soldiers ate locusts rather than give up Madinah

Guides are recognized by silhouette, dress and voice, never by a face.

## Structure
Three acts follow the three certainties. Seven chapters follow the seven classic stations (*maqamat*). The four movements follow Surah Al-Kahf's four trials: faith, wealth, knowledge, power.

| # | Chapter | Station | Vision | Kahf movement |
|---|---|---|---|---|
| 0 | Prologue | — | 1857: Ahmad Khan Kharal against the Company | — |
| 1 | The Forgetting | *Tawbah* (return) | Akbar's court; Gwalior Fort | Faith: the youths of the Cave |
| 2 | Freefall | *Wara'* (restraint) | Konya: the Masnavi's parables | Faith |
| 3 | The Hunger | *Zuhd* (renunciation) | Pakpattan and Delhi | Wealth: the man of two gardens |
| 4 | The Slow Descent | *Faqr* (need of Allah) | Baghdad 1095; Cordoba | Knowledge: the student and the hidden teacher |
| 5 | Foam | *Sabr* (endurance) | Granada; Hattin and Jerusalem, 1187 | Power: the builder of the wall |
| 6 | The Facemaker | *Tawakkul* (trust) | Cairo, 11th century | Power |
| 7 | I | *Rida* (contentment), then *fana* and *baqa* | Konya: the books in the water | — |

The nafs moves from *ammarah* (commanding evil) in Act I, through *lawwamah* (self-blaming) in Act II, to *mutma'innah* (at peace) in Act III.

### Prologue
1857, Punjab. Ahmad Khan Kharal rides against the Company's guns. Then the game cuts to the present: a bus climbs the Margalla Pass, and Burhan, half asleep, watches Nicholson's Obelisk catch the sun like gold. It is the player's first glimpse of the Gilding, though nobody knows it yet.

### Act I: *'Ilm al-yaqin*, knowing (chapters 1–2)
- Burhan wins a televised debate proving God exists, takes home the Professor Hadi Trophy, and feels nothing. Faraz sponsors the society and the family adores him. Azad laughs at both.
- One night, lost on a Margalla trail, Burhan meets Sain, who asks him a question he cannot prove an answer to.
- The Gilding flickers for the first time.
- **Chapter 1, The Forgetting.** In the Neutral Square, Burhan realizes he hasn't prayed in months. He makes *tawbah* and spends his first night of *khalwat* in the caves, and Iqbal appears as the first link of the chain. Iqbal takes him to the Mujaddid, who refused to bow to a state-made religion.
- **Chapter 2, Freefall.** Azad falls through the towers with no floors. Burhan can win every argument with him and cannot save him. Only *sohbat*, simply staying with him, reaches him, and late. Rumi teaches the frozen dragon. Burhan learns *wara'*, restraint: limits are floors.
- The act ends with the Gilding fully visible. Burhan now sees.

### Act II: *'Ayn al-yaqin*, seeing (chapters 3–5)
- **Chapter 3, The Hunger.**
  - The mall-temple and its liturgy.
  - Chaudhry Sahib's race for land.
  - The deathbed and the phone.
  - Baba Farid's dry bread and Nizamuddin's two doors.
  - Burhan learns *zuhd*: the world in the hand, not the heart.
- **Chapter 4, The Slow Descent (the midpoint).**
  - Burhan travels with Sain, and Sain does three strange things. This reframes the story of the student and the hidden teacher in Al-Kahf, with ordinary people.
    1. He breaks Burhan's phone. It was how the Facemaker watched him.
    2. He stops Burhan from winning an argument he was about to win. Winning would have shamed a man who was about to turn back.
    3. In Saidpur, where the villagers refused them food, he rebuilds a broken wall for free. Under it lies what Bilal's father left for him.
  - Then, in the middle of the biggest debate of his life, Burhan loses his voice, as Ghazali did in Baghdad. The lie "proof is enough" collapses.
  - In Cordoba he learns his name was stolen.
  - He learns the upgrade tree was a staircase down, and gives it back. That is *faqr*.
  - He recognizes the sweeper: "Are you… Professor Hadi?"
- **Chapter 5, Foam.**
  - Ibn Khaldun walks him through Granada's soft, beautiful court. Salahuddin shows him Hattin.
  - Burhan goes up into the mountains for a *chilla*, forty days of *mujahada*, and comes back changed.
  - He begins training Bilal in the park. He is becoming a *murabbi* (one who raises others), but deep down he still wants to be the hero.

### Act III: *Haqq al-yaqin*, being (chapters 6–7)
- **Chapter 6, The Facemaker.**
  - Sain vanishes, the way Shams vanished from Rumi's life.
  - Ibn al-Haytham shows Burhan the dark chamber where every image is upside down.
  - Faraz announces his grand launch at the Parade Ground. He calls it **Face Day**; its true name is **the Day of Adornment**, the day Pharaoh's magicians gathered the people (20:59).
  - Bilal has become famous as "the faceless boy of F-9 Park", and Faraz invites him on stage to receive a face before the whole city.
  - The city gathers against the faceless. "The people have gathered against you, so fear them," and it only increased their faith: "Allah is enough for us, and He is the best to rely on" (3:173). That is *tawakkul*.
- **Chapter 7, I.**
  - The night before, Shams appears in Burhan's vision and throws his trophies and books into the water.
  - On the Day of Adornment, Bilal stands alone on the stage and refuses. The crowd turns on him. Faraz, master of every image, looks at a face that wants nothing from the crowd, something he cannot make, and falls into sujood, like the magicians.
  - Burhan is not there. **The player chooses:**
    - **Run to the stage and be the hero.** The crowd cheers, and Faraz's machines give Burhan a face: a screen that says *Hero*. That is the hero's ending. The door of *tawbah* stays open, and the player can return.
    - **Stay in sujood in the cave, praying for Bilal.** That is the servant's ending.
- **The last vision.** In sujood, the chain carries Burhan to its last link, Uwais al-Qarani, and then to Madinah at dawn. He sees no figure: only light, the city waking, and an azan from far off.
- **The servant's ending.** Weeks later, Burhan sweeps the courtyard of the small mosque near the caves, holding Sain's broom. The camera, which has followed him all game, drifts away from him for the first time and finds Bilal teaching a younger boy. All four pillars are on screen at once: service, a clear mirror, teaching, and then the call, as Bilal climbs the steps and gives the azan. The chain goes on. The last words are "Enter among My servants."
- **The hidden ending.** It is for players who gave back every upgrade and never chased followers. The credits name every character but one, then end with "…and a servant."

## Length and pacing
A short game: about four and a half hours on a first playthrough, closer to six with the side visions and hidden books.

| Part | Time |
|---|---|
| Prologue: 1857 | 10 min |
| Act I: chapters 1–2 | 70 min |
| Act II: chapters 3–5 (chapter 4, the midpoint, runs longest) | 130 min |
| Act III: chapters 6–7 and the endings | 70 min |
| Side visions and hidden books (optional) | 30–60 min |

- **Each chapter has the same shape**, roughly 15, 10 and 15 minutes:
  1. Islamabad: people, story, a fight.
  2. The Gilding: the veil and its true name.
  3. The vision: the guide and the epic.
- **No filler.** In a short game every scene has to carry its lesson at all three depths at once. A scene that only moves the plot gets cut or merged.
- **Built to be played twice.** Short games get replayed, so the deepest layer is placed for the second playthrough: the trophy's name, Sain's habits, the gold on the obelisk, the hidden ending.

## Twists
| Twist | Set up | Paid off |
|---|---|---|
| The sweeper Sain is Professor Hadi | the trophy's name in the first scene | chapter 4's recognition scene |
| Burhan loses his voice | Act I: his voice is his weapon | the midpoint debate |
| His name was stolen | Act I: "burhan" means proof | Cordoba. Ibn Rushd's demonstrative proof (*burhan*) travelled into Europe, where his "Averroist" readers were accused of teaching two truths, one for reason and one for faith: an early seed of secular separation. The Gilding runs on proof cut off from revelation. Reason was never the enemy; severed reason is. |
| The upgrade tree was the Slow Descent's staircase | upgrades are offered from the start and feel like progress | chapter 4. The game turns its critique on its own reward loop. |
| Sain's three strange acts | chapter 4 | explained in chapter 4, and the wall in Act III |
| Bilal is the orphan of the wall | the wall in Saidpur | Act III |
| Sain vanishes | his habit of disappearing at dawn | chapter 6 |
| The Facemaker falls into sujood | Faraz's genuine love for beauty | the Day of Adornment |
| The hero isn't the hero; the last villain is "I" | Burhan's growing "followers" | chapter 7 |
| The Gilding is an inverted image | the gold that catches the sun on the obelisk | Ibn al-Haytham's dark chamber |

## How it plays
- **Form:** a third-person 3D action-adventure. You explore Islamabad, the Gilding and the visions; you talk, you remember, you fight, and you choose. Fighting can happen anywhere (see "Fighting").
- **Zikr (remembrance)** is the core action. It polishes the heart, peels the gold away, and opens the chain.
- **The heart-mirror (*aina-e-dil*)** replaces health bars and XP. Burhan's featureless face holds light as his heart is polished, and every sin leaves a stain (*ran*, 83:14) until he stops noticing. Others look at him and see themselves, because "the believer is the mirror of the believer."
- **Four ways to speak:** Ibn Rushd's three registers, plus one more.
  - *Burhan* (proof), for thinkers.
  - *Jadal* (debate, using the other side's own premises), for arguers.
  - *Khitaba* (moving speech and stories), for everyone.
  - *Sohbat* (companionship). It can't be picked from a menu; it grows only from time spent together: chai, cricket, helping. It is the only thing that truly changes people, because you cannot force-convert, only love-convert.
- **States that change the world:**
  - In *qabz* (contraction) the city narrows and darkens; in *bast* (expansion) it opens.
  - *Khawf* (fear) and *raja* (hope) shift the light and the music.
- **The Naqshbandi principles as controls:**
  - *Hosh dar dam*, awareness in every breath: a breathing rhythm during zikr and under pressure.
  - *Nazar bar qadam*, eyes on your steps: walking with a lowered gaze through the billboard streets keeps the heart clear.
  - *Khalwat dar anjuman*, solitude in the crowd: keeping your heart with Allah inside the mall while the whispers try to find you.
  - *Safar dar watan*, the journey home: the whole game is an inward journey that looks like an outward one.
- **The *lataif*** (subtle centres) are the true progression. *Qalb, ruh, sirr, khafi* and *akhfa* light up one by one across the chapters, in place of the false upgrade tree.
- **The false upgrade tree** offers speed, influence and followers, and it feels like progress. It is the Slow Descent's staircase.
- ***Adab*** (courtesy) opens doors. The way Burhan speaks to elders, guides and strangers changes what they show him.
- **True names** are revealed through *kashf* (unveiling) once the mirror is clear enough.
- **The four pillars** are the growth system, and **durood** and **the Sunnah** are actions in their own right (see their sections above).

## Fighting
Fighting can happen anywhere: in the visions, in Islamabad and in the Gilding. Every fight follows two rules: fight to protect, never for pride, and fight in control of yourself.

- **In the visions:** full battles at Hattin, Malazgirt, 1857 and in Algeria, fought under the Islamic rules of war. The Prophet ﷺ forbade mutilation and the killing of children (Muslim). Abu Bakr charged his army not to kill women, children or the old, not to cut down fruit trees, and to leave monks to their worship (Muwatta). The game won't let the player break these rules, and the colonial massacres show what war looks like without them.
- **In Islamabad:** hand-to-hand fighting built on the Sunnah sports and the subcontinent's own:
  - wrestling (the Prophet ﷺ threw the champion Rukana)
  - archery and riding
  - *kushti* in a dusty akhara

  Burhan fights to protect: the park kids from the dealers who sell "ice" to students, a shopkeeper from robbers, Bilal from a gang. The debater of Act I becomes a wrestler through *mujahada*, because "the strong believer is better and more beloved to Allah than the weak believer" (Muslim).
- **In the Gilding:** Burhan fights the veils' creatures, not people: whispers with screen faces, the Hunger's swarms, Freefall's winds, the Slow Descent's escalator guards. His mirror-face throws their own light back at them. They see themselves, and they crack. Zikr and durood are the light.
- **The rule of anger:** "The strong one is not the one who throws people down; the strong one is the one who controls himself when angry" (Bukhari). A fight won in anger still dims the mirror; a fight fought in control, to protect, polishes it.
- **Three depths:**
  - *Clear:* fight to protect, never to show off.
  - *Deep:* Islamic civilization fought by rules, and the colonial powers fought without them (Dahra, 1845).
  - *Deepest:* "The mujahid is the one who strives against his own self for Allah" (Tirmidhi). Every outer fight is also the inner one.

## Faces and look
- **Faces have no features.** Believers' faces are smooth, polished, and hold light. People in the Gilding wear screens for faces, and the screens show them what to want. A screen tells you what to want; a mirror shows you who you are.
- **Featureless faces are an advantage.** As Scott McCloud showed with comics, the less detail a face has, the more the player sees themselves in it.
- **Islamabad:** painterly and green, with monsoon light and the white Faisal Mosque. It is simple enough to run on a modest laptop in a browser.
- **The Gilding:** gold leaf over everything, glossy and mirrored. The gold flakes under zikr and shows clay.
- **The visions:** each one is drawn in its own civilization's art: Mughal miniature colour, Andalusian geometry, Seljuk turquoise, Punjabi folk walls, the light of Cairo.
- **Light is the language:** *nur*, *tajalli* (divine light made manifest), and the darkening of *qabz*.

## Voice and sound
- **Voices:** Urdu, with English subtitles (decided). Urdu subtitles too, so every Sufi term can be read as well as heard.
- **Masks speak English; the truth speaks Urdu.** The Gilding and its veils talk in English-heavy Urdu and wear English names. Once a veil is unveiled, its true name is spoken in plain Urdu, with the English in the subtitles:
  - ملمع, the Gilding
  - بھول, the Forgetting
  - گراوٹ, Freefall
  - بھوک, the Hunger
  - اترائی, the Slow Descent
  - جھاگ, Foam
  - چہرہ ساز, the Facemaker
  - میں, I
- **Nasheeds:** voice and daf only. Each era brings its own tradition, sung without instruments: Arabic qasida, Turkish ilahi, Punjabi kafi, Urdu naat.
- **Recitation:** Quran recitation carries every Prophet and Sahabi story.
- **Islamabad:** azan rolling off the Margallas, monsoon rain, koels, a cricket match in the park.
- **The Gilding:** no nasheeds, only the hum of notifications and the mask names whispering ("you deserve more").
- **Silence** in the cave is a sound of its own.

## What we borrowed
Old and sacred stories are reframed freely: their bones, not their skin. Modern works we learn from, but we don't copy their characters, worlds or look.

**Techniques**
- **The hero's journey** (Campbell): its stages carry Burhan. Dante's guided ascent shapes the chain of guides, as it shaped Iqbal's *Javid Nama*.
- **Story as a moral argument** (Truby): each villain attacks Burhan's exact weakness, and the climax is his self-revelation.
- **The lie the hero believes:** Burhan's two lies, "proof is enough" and "I must be the hero."
- **Reversal plus recognition** (Aristotle): Sain's unmasking, and the Facemaker's sujood. The Quran's recognition scene is "Are you indeed Yusuf?" (12:90).
- **Stories inside the story,** as in the Masnavi and the *1001 Nights*: Rumi's parables are played inside chapter 2.
- **Persuasion through rules** (Bogost's "procedural rhetoric"): the game argues through how it plays. The upgrade tree and the final choice are the lessons.
- **Knowledge as progression,** as in Outer Wilds: the real power is understanding.
- **Inner voices,** as in Disco Elysium: the whispers of the nafs and the mask names.
- **Simple faces draw players in,** as Scott McCloud showed.

**Stories**
- **Surah Yusuf**, "the best of stories" (12:3). Its word *burhan* (12:24) is the hero's name, and its recognition scene gives the model for Sain.
- **Surah Al-Kahf** gives the four trials, the hidden teacher's three acts, the youths whose sleep crossed centuries, and the wall.
- **Rumi's Masnavi** gives the frozen dragon, the painters and the polishers, the elephant in the dark, and the parrot who escaped its cage by playing dead. Its treasure-dream tale became *The Alchemist* by way of Borges, which shows that reframing works.
- **Attar's *Conference of the Birds*:** the long journey of the birds, and the mirror at its end.
- **Ibn Tufayl's *Hayy ibn Yaqzan*:** an early philosophical novel, from Andalusia.
- **Tolstoy's *How Much Land Does a Man Need?*,** which Joyce called the greatest story in world literature, becomes Chaudhry Sahib. ***The Death of Ivan Ilyich*** becomes the deathbed and the phone.
- **Dostoevsky's Grand Inquisitor,** and ***Brave New World's*** control through pleasure, feed Foam.
- **Plato's cave** sits under the Gilding.
- ***A Christmas Carol*** shows how visions of past, present and future change a man.
- ***Les Misérables:*** one act of grace converts a man, and that is *sohbat*.
- ***The Pilgrim's Progress:*** plain-English allegorical names like Vanity Fair and Giant Despair, the tradition our villain names come from.

## To confirm with ulama
1. No Prophet or Sahabi on screen, even faceless.
2. Whether great awliya and scholars (Rumi, Ghazali, the Mujaddid) may appear as featureless characters.
3. Whether visions of past saints through muraqaba, framed as in *Javid Nama*, are acceptable.
4. Whether animals (Malazgirt's horses, the cats of F-9) also have no features.
5. How women appear: fully covered, by voice only, or off screen. This affects Ammi and the young couple.
6. Nasheeds with daf only, and whether processed vocal effects count as music.
7. Hearing an azan in the vision of Madinah, and whether any Sahabi may be heard at all.
8. Showing Uwais al-Qarani, a Tabi'i, as a featureless guide.

## Open questions
1. **Burhan:** is this the Burhan you see?
2. **Naming Al-Burhan:** should the circle Burhan joins carry Al-Burhan's own name? That would make the game speak for the organization, so it may need the Majlis's approval.

## Notes on facts
- **Firm:**
  - Nicholson's Obelisk (1868) at the Margalla Pass.
  - The Shah Allah Ditta caves' line of monks, sadhus and a Mughal-era dervish.
  - The Mujaddid's imprisonment in Gwalior Fort.
  - Ghazali losing his voice before leaving Baghdad.
  - Ibn Khaldun's service at Granada's court in the 1360s.
  - Macaulay's 1835 Minute.
  - Joyce's praise of Tolstoy's story.
  - The Masnavi source of *The Alchemist*.
  - Rumi as Iqbal's guide in *Javid Nama*.
  - The French smoke-outs in Algeria's Dahra caves (1845), and Emir Abdelkader sheltering Christians in Damascus (1860).
  - The hadiths of durood and of Uwais al-Qarani (both in Muslim).
- **Tradition rather than record:**
  - The Mujaddid refusing to prostrate before Jahangir (Sahapedia calls it likely legendary; Iqbal's poem keeps it).
  - Alp Arslan's shroud.
  - Shams throwing Rumi's books into the water.
  - Ibn al-Haytham feigning madness.
  - Salahuddin refusing to smile while Al-Aqsa was occupied.
  - Imam Malik refusing to ride in Madinah.
  - Cordoba's lit streets, as popularly told.
  - The Prophet ﷺ wrestling Rukana (Abu Dawud and Tirmidhi; its chain is discussed).
- **Approximate:** the caves' age, which sources put at 2,400 to 2,500 years.


---

# Part 3: Scripts

*Full scripts for the prologue and all seven chapters. Where a script differs from the bible's outline, the script is newer and wins.*


## Prologue: Gogera, 1857

**Prologue: Gogera, 1857.** Draft 1. About 10 minutes. Part of the story bible (Part 2).

**How to read this script**
- Voices are Urdu. Each spoken line is in Urdu script, with its English subtitle in italics underneath.
- Stage directions and gameplay notes are in English.
- Each scene ends with its three depths: clear, deep, deepest.

---

### Scene 1: The camp by the Ravi
**Where:** Neeli Bar, Punjab, on the bank of the Ravi near Gogera. Night, September 1857.
**Who:** NOORA, a 14-year-old rider, and RAI AHMAD KHAN KHARAL, about 80, chief of the Kharals.
**Play:** The player controls Noora: walk the camp, brush the mare, feed her. It teaches movement and interaction. Campfires, tethered horses, men sharpening spears.

Title card:
نیلی بار، پنجاب — ستمبر ۱۸۵۷
*Neeli Bar, Punjab — September 1857*

Title card:
ایسٹ انڈیا کمپنی کو دہلی کی جنگ کے لیے گھوڑے چاہییں۔
*The East India Company wants horses for its war in Delhi.*

**KHARAL**
نورے پُتر، گھوڑی کو آج رات اچھا چارا دینا۔ کل اسے لمبا دوڑنا ہے۔
*Noora, son, feed the mare well tonight. Tomorrow she runs far.*

**NOORA**
سردار جی، کمپنی والے کہتے ہیں بس گھوڑے دے دو، تو لڑائی نہیں ہوگی۔
*Sardar ji, the Company men say: just hand over the horses and there'll be no fight.*

**KHARAL**
آج گھوڑے مانگتے ہیں۔ کل زمین مانگیں گے۔ پرسوں ہمارے بچوں کے دماغ۔
*Today they ask for horses. Tomorrow, the land. The day after, our children's minds.*

**KHARAL**
ہم اپنی زمین، اپنی عزت اور اپنا گھوڑا کسی کے حوالے نہیں کرتے۔
*We hand our land, our honour and our horse to no one.*

**NOORA**
ان کے پاس توپیں ہیں۔
*They have cannons.*

**KHARAL**
توپ کا گولہ ختم ہو جاتا ہے، پُتر۔ اللہ کے خزانے ختم نہیں ہوتے۔
*A cannon runs out of shot, son. Allah's treasures never run out.*

**KHARAL**
اور سن۔ کل جو ہتھیار نہ اٹھائے، اس پر ہاتھ نہیں اٹھانا۔ نہ عورت پر، نہ بچے پر، نہ بوڑھے پر۔ نہ کھیت جلانا، نہ درخت کاٹنا۔
*And listen. Tomorrow, raise no hand against anyone who doesn't raise a weapon. Not a woman, not a child, not an old man. Don't burn the fields. Don't cut the trees.*

**NOORA**
وہ تو ہمارے ساتھ ایسا نہیں کرتے۔
*They don't treat us that way.*

**KHARAL**
اسی لیے تو ہم وہ نہیں ہیں۔
*That is exactly why we are not them.*

**Depths**
- *Clear:* An old man refuses to hand his horses to a foreign company, and tells a boy how a Muslim fights.
- *Deep:* Colonial rule came for horses first, then land, then minds. The rules of war Kharal gives are the Islamic ones: no harm to those who don't fight, no burning, no cutting trees.
- *Deepest:* The boy's name, Noora, means light. A boy standing beside an old man foreshadows Bilal standing alone at the end.

---

### Scene 2: The jungle by the river
**Where:** The jungle along the Ravi near Gogera. Afternoon.
**Play:** The first battle, on horseback and on foot. Noora rides with Kharal's men against a Company column of sepoys and British officers. This teaches riding, strikes, guarding and dodging. Partway through, an unarmed Company water-carrier (*bhishti*), with his water skin on his back, runs across Noora's path in panic.
- If the player tries to strike him, the blow will not land. Noora's arm stops.
- Kharal's voice then calls out:

**KHARAL**
وہ لڑنے والا نہیں!
*He isn't a fighter!*

There is no prompt and no score. The game simply won't let the player harm someone who isn't fighting.

**Depths**
- *Clear:* Even in battle there are people you never strike.
- *Deep:* Islamic civilization fought by rules. The game's later colonial scenes show war without them.
- *Deepest:* The mechanic is the lesson: the rule is enforced by the controls, not by a lecture.

---

### Scene 3: Asr
**Where:** A clearing in the jungle. Late afternoon light through the trees.
**Play:** A lull. Kharal dismounts. His men form a ring around him. Noora guards the ring through waves of attackers.

**KHARAL**
عصر کا وقت ہو گیا۔
*It's time for Asr.*

**A RIDER**
سردار جی، ابھی؟ گورے قریب آ گئے ہیں!
*Sardar ji, now? The goras are close!*

**KHARAL**
جب اُس کا وقت ہو جائے، تو اُس سے پہلے کس کا وقت آتا ہے؟
*When His time has come, whose time comes before it?*

Kharal prays. Noora holds the line. Kharal goes into sujood. A single shot rings out from the trees, off-screen. Nothing is shown.
- The sound cuts.
- The screen fades to white.

Text cards on white:

رائے احمد خان کھرل ۲۱ ستمبر ۱۸۵۷ کو شہید ہوئے۔ روایت ہے کہ وہ نماز میں تھے۔
*Rai Ahmad Khan Kharal was killed on 21 September 1857. Tradition says he was at prayer.*

دو دن بعد دہلی میں کمپنی کا بریگیڈیئر جنرل جان نکلسن زخموں سے مر گیا۔
*Two days later, in Delhi, the Company's Brigadier-General John Nicholson died of his wounds.*

**Depths**
- *Clear:* He would not delay a prayer even in battle, and he died in sujood.
- *Deep:* He was a man without *wahn*, unafraid of death even at eighty.
- *Deepest:* Burhan's servant's ending is set in sujood too. The game opens and closes with a man bowed to Allah while the world fights.

---

### Scene 4: The pass
**Where:** The old GT Road, climbing the Margalla Pass toward Islamabad. Today, early afternoon.
**Who:** BURHAN, 19, half asleep on a bus seat. A SMALL BOY across the aisle, sitting with his father. AMMI on the phone (voice only).
**Play:** None. A slow cinematic.

The white fades into the glare of the sun. Burhan has earbuds in. He is listening to an English podcast, studying the other side for tomorrow's debate final. The host's smooth voice is the voice of the Moderator in chapter 1:

**PODCAST HOST (English)**
*"...religion is a private matter. In the public square, we stay neutral."*

On the hill above the road stands **Nicholson's Obelisk**. It catches the sun. For one second the whole hillside flashes gold, then it's gone. This is the player's first glimpse of the Gilding, though nothing explains it yet.

**SMALL BOY**
بھائی جان، وہ کس کا مینار ہے؟
*Bhai jaan, whose tower is that?*

**BURHAN** *(not looking up from his phone)*
پتا نہیں۔ کسی انگریز کا۔
*No idea. Some Englishman's.*

His phone rings.

**AMMI** *(phone)*
بیٹا، پہنچ گئے؟
*Did you get there, beta?*

**BURHAN**
بس امی، مارگلہ پہنچ گیا ہوں۔
*Almost, Ammi. I'm at the Margallas.*

**AMMI**
ظہر پڑھ لی تھی؟
*Did you pray Zuhr?*

Burhan looks out of the window. A beat.

**BURHAN**
جی امی۔
*Yes, Ammi.*

**AMMI**
اللہ تمہیں اپنی یاد میں رکھے۔
*May Allah keep you in His remembrance.*

**BURHAN** *(already back on his phone)*
آمین۔
*Ameen.*

The bus crests the pass. Islamabad opens below: green sectors, the Margalla ridge, the white Faisal Mosque.

Title: **بُرہان — BURHAN**

**Depths**
- *Clear:* Nobody remembers whose tower stands over the road. Burhan lies to his mother about his prayer.
- *Deep:* The colonizer gets a monument and the resister is forgotten: the Forgetting, set in stone. Burhan studies "neutral" arguments for a debate about God, and doesn't pray.
- *Deepest:* The obelisk was raised in 1868 for a general who died two days after Kharal. Ammi's dua turns "Remember Me; I will remember you" (2:152) into a mother's prayer, and chapter 1 answers it.

---

**Notes for this script**
- Kharal's refusal to hand over horses, his death on 21 September 1857, and Nicholson's death on 23 September 1857 are recorded. That he was killed while praying is tradition. "We hand our land, our honour and our horse to no one" echoes a line popularly attributed to him.
- The water-carrier rule is the first of the game's rules of war (see "Fighting" in the bible).
- Voices: Kharal speaks Urdu with a Punjabi warmth (*puttar*, *sardar ji*). The podcast host is the only English voice. The Gilding speaks English.


## Chapter 1: The Forgetting

**Chapter 1: The Forgetting.** Draft 1. About 40 minutes. Part of the story bible (Part 2).

- **Veil:** calls itself *Neutral*; its true name, spoken in Urdu, is **بھول** (subtitle: *The Forgetting*). Secularism.
- **Station:** *Tawbah* (return).
- **Guides:** Allama Iqbal, then the Mujaddid Alf Thani.
- **Shape:** Islamabad (scenes 1–5) → the Gilding (scene 6) → home and the cave (scenes 7–8) → the vision (scenes 9–11) → dawn (scene 12).

Same format as the prologue: Urdu lines with English subtitles underneath, directions in English, three depths after each scene.

---

### Scene 1: The final
**Where:** A university auditorium in Islamabad. Night. A televised national debate final, sponsored by SURAT, Faraz's company. Banners: *SURAT presents: The National Debate Final*.
**Who:**
- BURHAN
- REHAN, the opposition
- THE MODERATOR, in a grey suit. He is the mask of Neutral, but in the real world he is just a man.
- FARAZ, Burhan's cousin, the sponsor, known as "the Artist"
- A packed hall
**Play:** The first conversation system. Burhan has three registers:
- **Burhan** (proof)
- **Jadal** (debate)
- **Khitaba** (moving speech)

A fourth, **Sohbat**, sits locked on the wheel. Any register can win. The crowd meter shows which one moved them.

**MODERATOR**
لیڈیز اینڈ جینٹلمین، خوش آمدید۔ آج رات ہم نیوٹرل رہیں گے۔ نہ کوئی سائیڈ، نہ کوئی خطبہ۔ صرف دلیل۔
*Ladies and gentlemen, welcome. Tonight we stay neutral. No sides, no sermons. Only arguments.*

**MODERATOR**
آج کی قرارداد: یہ ایوان سمجھتا ہے کہ خدا کا ہونا ضروری ہے۔
*Tonight's motion: This house believes God is necessary.*

**REHAN**
سائنس ہر سوال کا جواب دے رہی ہے۔ جہاں جواب نہیں ملتا، وہاں آپ خدا رکھ دیتے ہیں۔ اور اخلاق؟ وہ ہم انسان خود بنا لیتے ہیں۔ مذہب ذاتی معاملہ ہے، اسے گھر پر رکھیے۔
*Science is answering every question. Wherever an answer is missing, you put God there. And morality? We humans make that ourselves. Religion is a private matter — keep it at home.*

The wheel opens.

**BURHAN** *(Burhan, proof)*
جو چیز اپنے ہونے کے لیے کسی اور کی محتاج ہو، وہ ہو بھی سکتی ہے اور نہیں بھی۔ یہ کائنات محتاجوں کی ایک لمبی زنجیر ہے۔ زنجیر کتنی ہی لمبی کیوں نہ ہو، لٹکنے کے لیے اسے ایک کھونٹی چاہیے جو خود کسی کی محتاج نہ ہو۔
*Anything that needs something else in order to exist might have existed, or not. This universe is a long chain of needy things. However long a chain is, to hang at all it needs a hook that needs nothing.*

**BURHAN** *(Jadal, debate)*
آپ کہتے ہیں اخلاق ہم خود بناتے ہیں۔ تو پھر آپ کا "چاہیے" صرف آپ کی پسند ہے۔ آپ ہمیں نیک بننے کو اس لیے کہہ رہے ہیں کہ آپ کو اچھا لگتا ہے؟
*You say we make morality ourselves. Then your "ought" is just your preference. You're asking us to be good because you happen to like it?*

**BURHAN** *(Khitaba, moving speech)*
میری ماں ہر رات میرے لیے دعا کرتی ہے۔ اگر خدا نہیں، تو وہ انیس سال سے کس سے باتیں کر رہی ہے؟
*Every night my mother prays for me. If there is no God, who has she been talking to for nineteen years?*

**SOHBAT** *(locked; tooltip)*
*This can't be chosen. It grows only from time spent together.*

The crowd roars at whichever line the player picks.

**MODERATOR**
اور جیتتے ہیں... بُرہان!
*And the winner is... Burhan!*

**FARAZ** *(on stage, handing over the trophy, warm)*
پروفیسر ہادی ٹرافی۔ مبارک ہو، چھوٹے۔ ہر جیتنے والے کا ایک ایسا چہرہ ہونا چاہیے جو دنیا یاد رکھے۔
*The Professor Hadi Trophy. Congratulations, little brother. Every winner deserves a face the world remembers.*

Cameras flash. Close on Burhan. His featureless face is dull, like unpolished steel. It reflects nothing but the stage lights.

**Depths**
- *Clear:* Burhan wins the biggest debate of his life and feels nothing.
- *Deep:*
  - The "neutral" rules have already put God on trial, as a motion to be voted on.
  - If the player chose Khitaba, Burhan used his mother's prayers as a debating trick, and he doesn't pray himself.
- *Deepest:*
  - The trophy carries the name of the man Burhan meets tonight. *Hadi* means "guide."
  - Rumi: the legs of those who rely on reasoning are wooden.

---

### Scene 2: Backstage
**Where:** Backstage corridor, after the final.
**Who:** BURHAN, ABBA (video call), AZAD (his hostel roommate).

**ABBA** *(video call)*
شاباش میرا شیر! فراز بتا رہا تھا، باہر کی اسکالرشپ پکی سمجھو۔ بس اب فراز کی طرح کچھ بن کے دکھاؤ۔
*Well done, my lion! Faraz says the scholarship abroad is as good as yours. Now go and become something, like Faraz.*

**BURHAN**
جی ابو۔
*Yes, Abbu.*

AZAD bursts in and grabs him in a hug.

**AZAD**
بھائی! تم نے خدا ثابت کر دیا! اب ذرا میس فنڈ بھی ثابت کر دو، تین مہینے سے غائب ہے۔
*Bro! You proved God exists! Now prove the mess fund exists — it's been missing for three months.*

Burhan laughs. It's the only laugh he gets tonight.

**AZAD**
اور سن، میں ہاسٹل چھوڑ رہا ہوں۔ بلیو ایریا میں فلیٹ لے لیا ہے۔ نہ وارڈن، نہ ٹائمنگ، نہ کوئی پوچھنے والا۔ آزادی، بھائی، آزادی!
*And listen, I'm leaving the hostel. Got a flat in Blue Area. No warden, no curfew, nobody asking questions. Freedom, bro — freedom!*

**Depths**
- *Clear:* Everyone around Burhan loves the win: his father, his cousin, his friend.
- *Deep:* Abba's love has been gilded, and success means "abroad, like Faraz." Azad's "freedom" sets up chapter 2.
- *Deepest:* Azad's name means "free."

---

### Scene 3: The trail
**Where:** Margalla Road at the foot of Trail 3, beside Saidpur village. Night.
**Who:** BURHAN, BILAL (14, a park kid from Saidpur), TWO DEALERS (older boys selling "ice" on the trail).
**Play:** A chase up the dark trail by phone-torch. It ends in the first fight, which Burhan is meant to lose.
- He is slow and untrained.
- If the player mashes attacks in anger, the screen's edges darken and Burhan's face dims further.
- Afterwards a soft line appears: *Anger dimmed the mirror.*

Burhan sits on the low wall at the trailhead with the trophy beside him. BILAL wanders past, bouncing a tennis ball.

**BILAL**
اوئے ہیرو! کیا جیتا ہے؟ سونا ہے؟
*Oye, hero! What'd you win? Is it gold?*

**BURHAN**
پیتل ہے۔
*It's brass.*

**BILAL** *(grinning)*
پھر تو تمہیں بھاری لگے گا۔
*Then it must be heavy for you.*

He snatches the trophy and runs up the trail. Chase.

Higher up, Bilal reaches two older boys under a pine. A lighter flickers. A small pouch changes hands.

**DEALER 1**
کیا لایا ہے، چھوٹے؟
*What've you brought, kid?*

**BILAL**
کچھ نہیں، بس پیتل۔
*Nothing — just brass.*

**BURHAN** *(catching up, breathless)*
وہ میری ہے۔ واپس کرو۔
*That's mine. Give it back.*

**DEALER 2** *(laughing)*
دلیل سے لے لو، ہیرو۔ ٹی وی پر تو بڑی دلیلیں دے رہے تھے۔
*Take it with an argument, hero. You had plenty of those on TV.*

Fight. Burhan goes down.

**BILAL** *(suddenly)*
بس! چھوڑو اسے!
*Enough! Leave him!*

The dealers shrug and walk off into the dark with the trophy. Bilal looks at Burhan on the ground for a moment, then runs after them.

**Depths**
- *Clear:* The champion of arguments can't defend himself.
- *Deep:* In Act I Burhan has only a tongue and a mind. He has no heart and no hands yet (the four pillars).
- *Deepest:*
  - "The strong believer is better and more beloved to Allah than the weak believer" (Muslim).
  - "The strong one is the one who controls himself when angry" (Bukhari).
  - Bilal shouting "Enough!" is the first sign of who he is.

---

### Scene 4: The sweeper
**Where:** A small stone mosque in the Margalla foothills, near the Shah Allah Ditta caves. Late night, at tahajjud time.
**Who:** BURHAN, SAIN (an old sweeper).
**Play:** Burhan has wandered west along the ridge for hours. He follows a lamp to the mosque. In the courtyard an old man is sweeping. The trophy sits on the mosque step, and small footprints lead away in the dust.

**SAIN** *(not looking up)*
ایک بچہ چھوڑ گیا ہے۔ کہتا تھا، کسی ہیرو کی ہے۔
*A boy left it. Said it belongs to some hero.*

Sain picks up the trophy and reads the plate: *Professor Hadi Trophy*. He laughs softly, to himself.

**BURHAN**
وہ میری ہے۔
*It's mine.*

**SAIN**
لے جاؤ۔ پیتل بوڑھے کے لیے بہت بھاری ہوتا ہے۔
*Take it. Brass is too heavy for an old man.*

He hands it over and pours tea from a dented kettle into two cups.

**SAIN**
بیٹھو۔ چائے پی لو، پھر راستہ بتا دیتا ہوں۔
*Sit. Drink some tea, then I'll show you the way.*

**SAIN**
کس بات پر جیتے ہو؟
*What did you win it for?*

**BURHAN**
میں نے ثابت کیا کہ اللہ ہے۔
*I proved that Allah exists.*

**SAIN**
کتنے لوگوں کے سامنے؟
*In front of how many people?*

**BURHAN**
ہزار سے زیادہ۔ ٹی وی پر اور بھی۔
*More than a thousand. More on TV.*

**SAIN** *(a long sip)*
اچھا۔ ہزار لوگوں کو بتایا کہ وہ ہے۔ خود آخری بار اُس سے بات کب کی تھی؟
*I see. You told a thousand people that He is there. When did you last talk to Him yourself?*

The conversation wheel opens. Burhan, Jadal and Khitaba are all greyed out, with the line: *No proof answers this.* Sohbat is still locked. The player can only wait. The kettle hisses. A long silence.

**SAIN** *(getting up, gently)*
جب یاد کرنا ہو، آ جانا۔ غار یہیں پاس ہے۔
*When you want to remember, come. The cave is close by.*

Sain climbs the few steps of the small minaret and gives the Fajr azan in an old, cracked voice. Burhan stands at the mosque door, then turns and walks down the hill.

**Depths**
- *Clear:* You can talk about Allah all day and never talk to Him.
- *Deep:* Knowing about God (*'ilm*) is not knowing God (*ma'rifat*). The system that won the debate has no move for the heart.
- *Deepest:* Sain is holding a trophy with his own name on it. Second-time players will know why he laughs.

---

### Scene 5: The first flicker
**Where:** The trail down, at dawn. Islamabad below in the haze.
**Play:** Walking. No dialogue.

For one second the whole city flickers gold. Blue Area's towers are plated, the roads shine, the sectors look like jewellery. Only the Faisal Mosque stays white. Then it's gone. Distant azans fade, and a koel calls.

**Depths**
- *Clear:* Something is wrong with the city.
- *Deep:* The Gilding coats everything modern: careers, towers, shops.
- *Deepest:* The one thing the gold cannot coat is a house of Allah. The people inside the gold forget it anyway (scene 6).

---

### Scene 6: The Neutral Square (the Gilding)
**Where:** The university quad, next noon. The Gilding takes over, and the quad turns gold.
- Students have screens for faces and scroll through their own faces.
- A podium. Banners in English: *NEUTRAL GROUND* and *ALL VIEWS WELCOME (KEEP FAITH PRIVATE)*.
- At the quad's edge stands an old mosque, not gilded, its doors open and empty.

**Who:** BURHAN, NEUTRAL (the Moderator, now with a calm grey screen for a face), STUDENTS, AZAD (screen-faced).
**Play:**
- Walk the quad. The ID cards on everyone's lanyards lose their letters as you watch.
- Then comes the first **zikr**: hold the button to remember.
- Then the first **kashf** (unveiling) of a true name.

**NEUTRAL** *(over the speakers, smooth)*
اس جگہ ہم سب برابر ہیں۔ اپنا خدا گھر پر رکھیے۔ یہاں صرف فیکٹس۔
*In this place, we're all equal. Keep your god at home. Here, only facts.*

**STUDENT A** *(pointing at the mosque)*
یہ بلڈنگ کس چیز کی ہے؟
*What's this building for?*

**STUDENT B**
پتا نہیں۔ ہیریٹیج ہوگی شاید۔
*No idea. Heritage, maybe.*

AZAD walks up.

**AZAD**
ارے... تم! یار، تمہارا نام... زبان پر ہے...
*Hey... you! Man, your name... it's on the tip of my tongue...*

**BURHAN**
میرا نام... میرا نام...
*My name... my name is...*

He can't say it. The letters of his name drain off his own ID card. The camera tilts and the sound narrows.

**NEUTRAL**
ریلیکس۔ نام تو پرائیویٹ معاملہ ہے۔
*Relax. A name is a private matter.*

Faint, from the prologue:

**AMMI** *(echo)*
اللہ تمہیں اپنی یاد میں رکھے۔
*May Allah keep you in His remembrance.*

Prompt: **Zikr — hold to remember.**

**BURHAN** *(a whisper, then a breath)*
اللہ... اللہ...
*Allah... Allah...*

While the player holds the button:
- The gold flakes off the ground around him, and clay and grass show through.
- His name comes back one letter at a time: ب ر ہ ا ن.

**BURHAN**
بُرہان۔ میرا نام بُرہان ہے۔
*Burhan. My name is Burhan.*

**Kashf.** Neutral's grey screen cracks. Under the English mask *NEUTRAL*, a single Urdu word shows through: **بھول**. Subtitle: *THE FORGETTING*.

**THE FORGETTING** *(a tired, ordinary voice, no longer smooth)*
میں نے کبھی انکار نہیں کیا۔ کبھی کسی سے نہیں کہا کہ وہ نہیں ہے۔ میں تو بس... بھلا دیتا ہوں۔
*I never denied Him. I never told anyone He isn't there. I only... make you forget.*

He breaks into grey dust that blows across the quad. The banners fall. The mosque door stands open.

Burhan walks to the mosque and makes wudu at an old tap. The sound of water is the loudest thing in the game so far. He prays Zuhr alone. The camera stays respectful and distant, with no prompts. After the salam he raises his hands. There is no wheel, only his voice.

**BURHAN**
یا اللہ... میں نے ہزار لوگوں کے سامنے تجھے ثابت کیا، اور تجھ سے کبھی بات نہیں کی۔ میں بھول گیا تھا۔ مجھے واپس لے لے۔
*O Allah... I proved You in front of a thousand people, and never once spoke to You. I had forgotten. Take me back.*

The station appears quietly: **توبہ — TAWBAH (return)**.

**Depths**
- *Clear:* Leave God out of daily life and you slowly forget who you are.
- *Deep:*
  - "Neutral" isn't neutral. It ranks God as a private hobby, and the market and the self as public truth.
  - The mask speaks English; the truth speaks Urdu.
- *Deepest:*
  - "They forgot Allah, so He made them forget themselves" (59:19). An old etymology ties *insan* (human) to *nisyan* (forgetting).
  - Ammi's dua is 2:152.
  - *Tawbah* means return.
  - Hidden book on the quad library's shelf: the Pakistan Penal Code of 1860, drafted by Macaulay's law commission and still the base of the country's criminal law.

---

### Scene 7: The stairs
**Where:** The hostel stairwell. Night.
**Who:** BURHAN, AMMI (phone, voice only).

**AMMI**
نماز پڑھی، بیٹا؟
*Did you pray, beta?*

**BURHAN**
جی امی۔
*Yes, Ammi.*

A pause. This time it's true, and he doesn't know how to say the rest.

**BURHAN**
امی... میرے لیے دعا کیجیے گا۔
*Ammi... please pray for me.*

**AMMI**
میں تو روز کرتی ہوں، پاگل۔
*I do, every day, silly.*

He sits on the stairs and his shoulders shake. For the first time his smooth face catches the stairwell light, faintly.

**Depths**
- *Clear:* The same question from the prologue, answered truthfully this time.
- *Deep:* Tawbah mends what the Forgetting broke: first with Allah, then with family.
- *Deepest:* The prologue's dua has been answered.

---

### Scene 8: The cave
**Where:** The small mosque, then the Shah Allah Ditta caves. Night. Old roots grip the rock. Inside it is dark, cool, and smells of stone.
**Who:** BURHAN, SAIN.
**Play:** The second inner mechanic, **hosh dar dam** (awareness in every breath). It is a slow breathing rhythm: breathe in on *Allah*, breathe out on *Hu*.

Sain is sweeping, as if he expected him.

**SAIN**
آ گئے؟ چلو۔
*You came? Come on.*

They walk to the caves.

**SAIN**
صدیوں سے لوگ اس غار میں ڈھونڈنے آئے۔ کسی کو اپنا آپ ملا، کسی کو کچھ نہیں۔ ایک درویش کو وہ ملا۔
*For centuries people came to this cave to search. Some found themselves; some found nothing. A dervish found Him.*

**SAIN**
سانس اندر جائے تو اللہ۔ سانس باہر آئے تو ہُو۔ بس اتنا ہی۔ باقی وہ خود سکھا دے گا۔
*When the breath goes in: Allah. When it comes out: Hu. That's all. He will teach you the rest.*

**SAIN** *(leaving)*
میں باہر ہوں۔
*I'm outside.*

*Khalwat* (seclusion). The dark deepens. The breath goes in and out. The cave wall begins to glow. The Silsila opens.

**Depths**
- *Clear:* Burhan learns to remember with every breath.
- *Deep:* Seclusion is the opposite of the Gilding's endless noise. *Hosh dar dam* is the first of the Naqshbandi principles.
- *Deepest:* The cave echoes the youths of Al-Kahf, whose sleep crossed centuries. From here, time opens.

---

### Scene 9: Sirhind, 1934 (vision)
**Where:** The tomb of the Mujaddid Alf Thani at Sirhind. Night, oil lamps.
**Who:** IQBAL (old, with a cane and a fur cap, featureless, known by his silhouette), BURHAN.
**Play:** Walking and listening. The light here is amber and warm. It is never the Gilding's gold.

**IQBAL** *(at the grave)*
حاضر ہوا میں شیخِ مجدد کی لحد پر
وہ خاک کہ ہے زیرِ فلک مطلعِ انوار
*I came to the grave of the Shaikh, the Renewer —*
*that dust beneath the sky from which the lights rise.*

He turns, sensing someone.

**IQBAL**
تم اس زمانے کے نہیں لگتے۔
*You don't look like you belong to this age.*

**BURHAN**
میں... آپ کے بعد کے زمانے سے ہوں۔ آپ کا پاکستان... بن گیا۔
*I'm... from after your time. Your Pakistan... it happened.*

**IQBAL** *(quietly)*
الحمدللہ۔ تو بتاؤ — فرنگ کی چمک اب بھی آنکھیں چندھیا رہی ہے؟
*Alhamdulillah. Then tell me — is the West's glitter still blinding eyes?*

**BURHAN**
اب تو وہ ہمارے گھروں میں ہے۔ ہماری زبان میں۔ ہمارے فون میں۔
*Now it's inside our homes. In our language. In our phones.*

**IQBAL**
خیرہ نہ کر سکا مجھے جلوۂ دانشِ فرنگ
سرمہ ہے میری آنکھ کا خاکِ مدینہ و نجف
*The dazzle of the West's learning could not blind me;*
*the dust of Madinah and Najaf is the kohl of my eyes.*

**IQBAL**
میں ان کے گھر میں رہا۔ کیمبرج، میونخ۔ ان کا علم پڑھا۔ مگر آنکھ کا سرمہ مدینے کی خاک کو رکھا۔
*I lived in their house. Cambridge, Munich. I read their learning. But I kept the dust of Madinah as the kohl of my eyes.*

**IQBAL**
ان کے ایک لارڈ نے لکھا تھا: ایسا طبقہ بناؤ جو رنگ میں ہندوستانی ہو، مگر مزاج میں انگریز۔ انہوں نے ہمیں مارا کم، بھلایا زیادہ۔
*One of their lords wrote: make a class Indian in colour, but English in taste. They killed fewer of us than they made forget.*

**IQBAL** *(looking west, past Burhan)*
تمہاری تہذیب اپنے خنجر سے آپ ہی خودکشی کرے گی
جو شاخِ نازک پہ آشیانہ بنے گا، ناپائدار ہوگا
*Your civilization will kill itself with its own dagger;*
*a nest built on a fragile branch will not last.*

**IQBAL**
آؤ۔ تمہیں اس سے ملاؤں جس کی گردن جہانگیر کے آگے نہیں جھکی۔
*Come. Let me take you to the one whose neck did not bow before Jahangir.*

He touches the edge of the grave, and the lamplight deepens.

**Depths**
- *Clear:* A great poet who lived in Europe saw through it and stayed loyal to Madinah.
- *Deep:* Macaulay's plan (1835) was colonization of the mind. The West's learning is one thing; its glitter is another.
- *Deepest:*
  - Iqbal visited this grave and wrote these lines.
  - In *Javid Nama*, Rumi guided Iqbal. Now Iqbal guides Burhan, and the chain begins.

---

### Scene 10: The House of Debate, about 1580 (vision)
**Where:** The Ibadat Khana at Fatehpur Sikri: a hall of debate, with scholars of many faiths seated in rings.
**Who:** THE EMPEROR on a raised seat, a HERALD, courtiers, IQBAL, BURHAN.
**Play:** The player can walk the hall. A hidden book holds a page on the *Din-i-Ilahi*, the emperor's new religion for all, and on the prostration demanded at court.

**HERALD** *(in the same grey voice as the Moderator)*
اس دربار میں سب برابر ہیں۔ کوئی دین کسی سے بڑا نہیں۔ صلحِ کل — سب سے صلح۔
*In this court all are equal. No faith is greater than another. Sulh-i-kul — peace with all.*

Courtiers kneel and touch their foreheads to the floor before the throne.

**BURHAN** *(to Iqbal, stunned)*
یہ تو... میرا ڈیبیٹ ہال ہے۔ یہی آواز۔
*This is... my debate hall. The same voice.*

**IQBAL**
بھول پرانی ہے، بیٹا۔ بس لباس بدلتی ہے۔
*The Forgetting is old, son. It only changes its clothes.*

**Depths**
- *Clear:* The idea that "all faiths are equal, so keep yours quiet" is not new.
- *Deep:* Akbar's *sulh-i-kul* and *Din-i-Ilahi* were state-made neutrality, four centuries before secularism. A hall of debates ended in a new religion.
- *Deepest:* The Moderator's voice is the Herald's voice. The Forgetting wears one costume after another.

---

### Scene 11: Gwalior Fort, 1620 (vision)
**Where:** A prison yard in Gwalior Fort. Night.
**Who:** THE MUJADDID ALF THANI (Shaykh Ahmad Sirhindi; in white, calm, featureless), a circle of PRISONERS he is teaching, BURHAN, IQBAL.

**BURHAN**
آپ نے سجدہ کیوں نہیں کیا؟ ایک بار گردن جھکا دیتے، جان چھوٹ جاتی۔
*Why didn't you prostrate? Bow your neck once and you'd have been free.*

**MUJADDID**
جو گردن اللہ کے آگے جھکتی ہے، وہ کسی اور کے آگے نہیں جھک سکتی۔ اور جو ہر ایک کے آگے جھک جائے، وہ اللہ کو بھول جاتی ہے۔
*A neck that bows to Allah cannot bow to anyone else. And a neck that bows to everyone forgets Allah.*

**BURHAN**
بادشاہ تو کہتا تھا سب برابر ہیں۔ صلحِ کل۔ کیا یہ انصاف نہیں؟
*The emperor said all are equal — peace with all. Isn't that justice?*

**MUJADDID**
انصاف ہر ایک کے ساتھ۔ مگر حق ہر ایک کا برابر نہیں۔ جو کہے سب راستے ایک ہیں، وہ کسی راستے پر نہیں چلتا۔
*Justice, with everyone. But the truth is not equally everyone's. Whoever says all paths are one walks on none.*

**BURHAN**
شریعت، طریقت، حقیقت... گہری بات کون سی ہے؟
*Shariat, tariqat, haqiqat... which one is the deep one?*

**MUJADDID**
طریقت اور حقیقت، شریعت کی خادم ہیں۔ جو گہرائی اوپر کی بات کو جھٹلا دے، وہ گہرائی نہیں — گڑھا ہے۔
*Tariqat and haqiqat are the servants of shariat. A depth that contradicts the surface isn't depth — it's a pit.*

A prisoner smiles, and others nod. The Mujaddid turns back to his circle.

**IQBAL** *(as the vision fades)*
گردن نہ جھکی جس کی جہانگیر کے آگے
جس کے نفسِ گرم سے ہے گرمیِ احرار
*Whose neck did not bow before Jahangir,*
*whose warm breath gives the free their fire.*

**Depths**
- *Clear:* He went to prison rather than bow to anyone but Allah.
- *Deep:* Justice for everyone is not the same as "all truths are equal." Secular neutrality confuses the two.
- *Deepest:*
  - The Mujaddid's teaching that tariqat and haqiqat serve the shariat is the game's own rule of the three depths.
  - "Pit" foreshadows Freefall in chapter 2.
  - Tradition says many prisoners at Gwalior found guidance through him.

---

### Scene 12: Fajr
**Where:** The cave mouth, then the small mosque. Dawn.
**Who:** BURHAN, SAIN.
**Play:** Burhan wakes in the cave to the Fajr azan in Sain's cracked voice. He comes out and prays Fajr in jamaat behind Sain, two men in a small mosque. The camera stays distant, with no prompts. After the salam, Sain turns to him. For a moment, on Burhan's smooth face, Sain sees his own reflection, faintly.

**SAIN**
اب کچھ نظر آیا۔
*Now something shows.*

Title: **بھول — THE FORGETTING. توبہ — TAWBAH.** A small light glows at the left of Burhan's chest. It is the first of the *lataif*: **qalb**, the heart.

**Depths**
- *Clear:* Burhan has come back.
- *Deep:* The heart-mirror begins to polish, and others start to see themselves in him.
- *Deepest:* "The believer is the mirror of the believer" (Abu Dawud). *Qalb* is the first of the subtle centres.

---

**Notes for this script**
- **Masks speak English; the truth speaks Urdu.** The Gilding and its veils speak English-heavy Urdu, written in Urdu script, and their mask names are English. When a veil is unveiled, its true name is spoken in plain Urdu, and the subtitle gives the English. This chapter uses نیوٹرل → بھول.
- **Salah is never a game.** Wudu, prayer and dua are never button prompts. The camera keeps its distance and the player only chooses to walk in.
- **Sources.**
  - Iqbal's lines are his own published verse, from *Bang-e-Dra* and *Bal-e-Jibril*, which are in the public domain.
  - The Mujaddid's and Iqbal's spoken lines are written for the game, based on their known teachings. They are not quotations.
  - Iqbal's paraphrase of Macaulay ("Indian in colour, English in taste") follows Macaulay's 1835 Minute on education.
- **To confirm with ulama** (see the bible): showing the Mujaddid and Iqbal as featureless characters, and the muraqaba vision itself.


## Chapter 2: Freefall

**Chapter 2: Freefall.** Draft 1. About 35 minutes. Part of the story bible (Part 2).

- **Veil:** calls itself *Freedom*. Its true name, spoken in Urdu, is **گراوٹ** (subtitle: *Freefall*). It stands for liberalism.
- **Station:** *Wara'* (restraint).
- **Guide:** Maulana Rumi.
- **Pillar:** Islah, reform through restraint.
- **Shape:** Islamabad (scenes 1–3) → the Gilding (4) → the vision (5) → the Gilding again (6) → the hospital (7) → dawn (8).

Format as in chapter 1: Urdu lines with English subtitles underneath, directions in English, and three depths after each scene.

---

### Scene 1: The flat
**Where:** Azad's new rooftop flat in a Blue Area tower. Night.
- A party: crowd noise, laughter, phones chiming.
- No music is ever heard, only voices and city noise through the glass.

**Who:** BURHAN, AZAD, party guests (screen-lit faces bent over phones).
**Play:** Walk through the party. Guests offer drinks and vapes; Burhan can pass by or refuse.

**AZAD** *(arms wide)*
آ گیا میرا مولوی! دیکھ، یہ ہے آزادی۔ نہ وارڈن، نہ ابو، نہ کوئی گھنٹی۔
*My maulvi's here! Look — this is freedom. No warden, no Abbu, no bell.*

**BURHAN**
تم نے کلاسیں کب سے چھوڑی ہوئی ہیں؟
*Since when have you been skipping classes?*

**AZAD**
کلاسیں؟ بھائی، میں زندگی پڑھ رہا ہوں۔
*Classes? Bro, I'm studying life.*

He takes a small pouch from his pocket. It is the same kind of pouch the dealers passed around on the trail in chapter 1.

**BURHAN**
یہ کہاں سے لیا؟
*Where did you get that?*

**AZAD**
ریلیکس۔ میرا جسم، میری مرضی۔ میں کسی کو نقصان تو نہیں پہنچا رہا۔
*Relax. My body, my choice. I'm not hurting anyone.*

**Depths**
- *Clear:* Azad thinks freedom means nobody can tell him anything.
- *Deep:* "I'm not hurting anyone" is the harm principle, the heart of liberal morality. It cannot see harm done to the self, or to the people who love you.
- *Deepest:* Azad's slogan is borrowed from a different cause. One logic, once accepted, reaches everywhere.

---

### Scene 2: Every argument fails
**Where:** The rooftop edge, away from the party. The city lights are below.
**Play:** The conversation wheel. Every register works on the crowd meter of Azad's attention, and every one of them bounces off. Sohbat is still locked.

**BURHAN** *(Burhan, proof)*
اگر صرف تمہاری مرضی معیار ہے، تو کل کی مرضی آج کی مرضی کو جھٹلا دے گی۔ جو معیار روز بدلے، وہ معیار نہیں، موسم ہے۔
*If your will is the only measure, tomorrow's will can overturn today's. A measure that changes every day isn't a measure — it's weather.*

**BURHAN** *(Jadal, debate)*
تم کہتے ہو کسی کو نقصان نہیں پہنچا رہے۔ تو پھر یہ بتاؤ، تمہاری امی فون اٹھاتے ہوئے کیا سوچتی ہیں؟
*You say you're not hurting anyone. Then tell me what your mother thinks every time she picks up the phone.*

**BURHAN** *(Khitaba, moving speech)*
یاد ہے پہلے سال؟ تم مجھے فجر میں جگاتے تھے۔
*Remember first year? You used to wake me for Fajr.*

Whatever the player chose:

**AZAD**
تمہارے پاس ہر بات کی دلیل ہے، بھائی۔ میرے پاس صرف ایک زندگی ہے۔
*You've got an argument for everything, bro. I've only got one life.*

He walks back into the party.

**SOHBAT** *(locked; tooltip)*
*This can't be chosen. It grows only from time spent together.*

**Depths**
- *Clear:* You can't argue a friend out of a fall.
- *Deep:* Liberalism doesn't lose arguments; it leaves the room. "My life" ends every debate, because no argument can reach a self that is its own final judge.
- *Deepest:* The Khitaba line shows that Azad was once the one who woke Burhan for prayer. His fall is recent, and the game will reverse the roles before the chapter ends.

---

### Scene 3: The dealers
**Where:** The stairwell and landing outside the flat.
**Who:** BURHAN, the TWO DEALERS from chapter 1, AZAD.
**Play:** A fight Burhan can win, and does. But the game watches how he wins.
- If he fights in anger, mashing and chasing, he wins and his face still dims. A line appears: *You won. Anger still dimmed the mirror.*
- If he fights in control (blocking, holding, letting them go), the mirror stays clear.
- Most players will fight in anger the first time. That's the lesson.

**DEALER 1** *(recognising him)*
اوئے، ٹی وی والا ہیرو! آج دلیل لایا ہے یا ہاتھ؟
*Oye, the TV hero! Brought an argument tonight, or your hands?*

Fight. The dealers flee down the stairs. Azad comes out and sees what happened.

**AZAD** *(furious)*
تم کون ہوتے ہو میری زندگی کا فیصلہ کرنے والے؟ نکلو یہاں سے!
*Who are you to decide my life for me? Get out of here!*

Burhan leaves. As the door closes, Azad climbs the rail at the roof's edge, laughing, arms out to the wind.

**Depths**
- *Clear:* Winning in anger is still losing something.
- *Deep:* Force doesn't free anyone. Burhan has hands now, but no heart behind them yet (the four pillars).
- *Deepest:* "The strong one is not the one who throws people down; the strong one is the one who controls himself when angry" (Bukhari).

---

### Scene 4: The tower with no floors (the Gilding)
**Where:** The same tower in the Gilding. It's a golden shaft of air with no floors at all.
- People drift down it slowly, smiling, scrolling, as if floating.
- A wind blows through everything. It is the voice of the veil.

**Who:** BURHAN, AZAD, FREEDOM (a voice in the wind; when it takes a shape, a tall figure whose screen-face shows open sky).
**Play:** A falling sequence.
- The more Burhan thrashes and steers "freely," the faster he falls.
- Zikr slows him a little, but not enough.
- He can see Azad below him, falling away and laughing.

**AZAD** *(stepping off the edge)*
دیکھو، میں اُڑ رہا ہوں!
*Look — I'm flying!*

Burhan jumps after him.

**FREEDOM**
کوئی تمہیں نہیں بتا سکتا کہ کیا کرنا ہے۔
*No one can tell you what to do.*

**FREEDOM**
نہ خدا، نہ باپ، نہ رواج۔ تم آزاد ہو۔
*No God, no father, no custom. You are free.*

**BURHAN** *(reaching for Azad, missing)*
آزاد! ہاتھ پکڑو!
*Azad! Take my hand!*

**AZAD** *(drifting away)*
کیوں؟ گرنا کتنا ہلکا لگتا ہے!
*Why? Falling feels so light!*

They fall into blackness. Burhan remembers the Mujaddid's words from chapter 1: *a depth that contradicts the surface isn't depth — it's a pit.* In the dark, he finds his breath: *Allah* in, *Hu* out. The falling slows, then turns into passage. The Silsila opens.

**Depths**
- *Clear:* Total freedom is a free fall. The freer you get, the faster you fall.
- *Deep:* Liberalism removes every floor: God, family, custom. It cannot say why the individual is sovereign, or why anything is owed to anyone. A life with no "ought" has nothing to land on.
- *Deepest:* "Have you seen the one who takes his desire as his god?" (25:43). In Arabic, *hawa* (desire) shares its root with *hawiyah*, the pit (101:9).

---

### Scene 5: The frozen dragon (vision)
**Where:** Konya, about 1250. Rumi's madrasa, then the story he tells, which becomes a place: the bazaar of Baghdad in winter, then under a rising sun.
**Who:**
- MAULANA RUMI: featureless, in a scholar's turban, known by his silhouette and his voice.
- His STUDENTS.
- The SNAKE-CATCHER.
- The CROWD.
- The DRAGON: a vast coil of smoke and stone with no face.
- BURHAN.

**Play:** A story inside the story. Burhan walks into Rumi's parable and tries to keep the dragon cold. He can drag tarps over it and shout warnings, but the crowd keeps pulling the covers off to see. The sun climbs no matter what he does.

**RUMI** *(to his students, and to Burhan)*
ایک سپیرا پہاڑوں سے ایک مردہ اژدہا گھسیٹ کر بغداد لایا، تماشا دکھانے کو۔ اژدہا مرا نہیں تھا۔ سردی سے ٹھٹھرا ہوا تھا۔
*A snake-catcher dragged a dead dragon from the mountains to Baghdad, to make a show of it. The dragon wasn't dead. It was frozen with cold.*

The parable plays. Burhan tries to cover it.

**SNAKE-CATCHER** *(to the crowd)*
آؤ، آؤ! دیکھو میرا شکار! ایک پیسہ، بس ایک پیسہ!
*Come, come! See my catch! One coin, just one coin!*

**BURHAN**
اسے دھوپ سے بچاؤ! یہ جاگ جائے گا!
*Keep it out of the sun! It'll wake up!*

**A MAN IN THE CROWD**
ہٹو بھائی، ہمیں دیکھنے دو۔ ہمارا حق ہے۔
*Move, brother, let us see. It's our right.*

The sun warms the stone. The coils shift, and the dragon wakes. It swallows the snake-catcher and a wide stretch of the crowd. Burhan is thrown clear. The bazaar turns to dust, and Rumi's room returns.

**RUMI** *(Masnavi, in Persian)*
نفست اژدرهاست، او کی مرده است
از غم بی‌آلتی افسرده است
*Your nafs is a dragon — how is it dead?*
*It is only frozen, for want of means.*

**RUMI**
تمہارا نفس بھی وہی اژدہا ہے۔ شرم نے، خوف نے، ماحول نے اسے ٹھنڈا رکھا ہوا تھا۔ جس دن کسی نے کہا "تم آزاد ہو"، دھوپ نکل آئی۔
*Your nafs is that same dragon. Shame, fear and the world around you kept it cold. The day someone said "you are free," the sun came out.*

**BURHAN**
تو آزادی بری ہے؟
*So freedom is bad?*

**RUMI**
آزادی یہ نہیں کہ کوئی حد نہ ہو۔ آزادی یہ ہے کہ اللہ کے سوا کسی کی غلامی نہ ہو۔
*Freedom isn't having no limits. Freedom is being no one's slave but Allah's.*

**RUMI**
جو ہر خواہش کا غلام ہو، اسے آزاد کون کہے گا؟
*Who would call a man free who is the slave of every desire?*

**RUMI**
حدیں قید نہیں، پاؤں رکھنے کی جگہ ہیں۔
*Limits aren't a prison. They're a place to put your feet.*

**Depths**
- *Clear:* The desires we call "free" are a sleeping dragon, and freedom is the sun that wakes it.
- *Deep:* Shame, fear of Allah, family and custom were never cages. They kept the nafs cold. Liberalism calls them oppression and takes them away, and the crowd demands to see the dragon as a right.
- *Deepest:*
  - The parable of the snake-catcher and the frozen dragon is from the third book of Rumi's Masnavi.
  - The Sufis define *hurriyat* (freedom) as being a slave to nothing created.
  - Allah's limits (*hudud*, 2:229) are the floors.

---

### Scene 6: Floors (the Gilding)
**Where:** The tower again.
**Play:** The new mechanic: ***wara'*, restraint.**
- Burhan places floors under his feet, slabs of clay and stone. They are limits, and they stop the fall.
- He climbs a stair of his own floors.
- He reaches Azad and places a floor under him. It cracks under Azad's weight and falls away. A limit can't be laid under someone who won't stand on it.

**FREEDOM** *(mocking)*
دیکھا؟ وہ اپنی مرضی سے گر رہا ہے۔ یہی تو آزادی ہے۔
*See? He's falling by his own choice. That's what freedom is.*

**Kashf.** Freedom's sky-screen cracks. Under the English mask *FREEDOM* one Urdu word shows through: **گراوٹ**. Subtitle: *FREEFALL*.

**FREEFALL** *(its true voice, flat and tired)*
میں نے کسی کو دھکا نہیں دیا۔ میں نے بس... پکڑنے والا ہاتھ ہٹا دیا۔
*I never pushed anyone. I only... took away the hand that would catch them.*

The wind dies. Somewhere in the gold, a phone rings. The real world is breaking through. Burhan answers.

**A STRANGER** *(phone)*
آپ برہان ہیں؟ آپ کا دوست... پمز ایمرجنسی میں ہے۔ جلدی آئیں۔
*Are you Burhan? Your friend... he's in PIMS emergency. Come quickly.*

**Depths**
- *Clear:* Limits save you from falling. Nobody can force them on someone else.
- *Deep:* Liberalism never pushes anyone. It removes the family, the shame and the community that once caught people. Divorce, addiction and loneliness are falls with no one there to catch.
- *Deepest:* *Wara'* is restraint even in what is doubtful. It is the second of the classic stations, after the *tawbah* of chapter 1.

---

### Scene 7: The night at PIMS
**Where:** PIMS hospital, Islamabad: an emergency corridor, then a ward. Night until dawn.
**Who:** BURHAN, AZAD (in a hospital bed), a DOCTOR, AZAD'S FATHER (arriving at dawn from Multan).
**Play:** **Sohbat unlocks.** It is not a line on the wheel. It is an action: *Stay.*
- Holding "Stay" lets time pass.
- The corridor light changes, nurses come and go, and Burhan's phone shows missed calls.
- He can leave at any time. Nothing stops him.
- At Fajr he prays in the hospital's prayer room, off-camera, then comes back and stays.

**DOCTOR**
اوور ڈوز ہے۔ بچ جائے گا، ان شاء اللہ۔ مگر رات بھاری ہے۔
*It's an overdose. He'll live, in sha Allah. But it's a heavy night.*

Hours pass. Near dawn, Azad wakes and finds Burhan still in the chair.

**AZAD** *(weak)*
تم گئے کیوں نہیں؟
*Why didn't you leave?*

Burhan says nothing. On the wheel, the **Sohbat** mark lights for the first time.

**AZAD** *(turning to the wall)*
پہلے سال... میں تمہیں فجر میں جگاتا تھا۔
*First year... I used to wake you for Fajr.*

**BURHAN**
کل میں جگاؤں گا۔
*Tomorrow I'll wake you.*

Azad's shoulders shake. His father's footsteps come down the corridor.

**Depths**
- *Clear:* You can't argue a friend out of a fall. You can stay.
- *Deep:* Company (*sohbat*) changes people when proofs can't. This is the fourth way of speaking, and it can't be chosen from a menu, only lived.
- *Deepest:* "A man is upon the religion of his close friend, so let each of you look to whom he befriends" (Abu Dawud). The one who once woke Burhan will be woken by him now. Reminding (*tazkeer*) begins as company.

---

### Scene 8: Dawn at the small mosque
**Where:** The small mosque near the caves. Early morning.
**Who:** BURHAN, SAIN.
**Play:** Walking up, sitting, tea.

Sain is sweeping. Burhan sits on the step, exhausted.

**BURHAN**
میں نے ہر دلیل دی۔ کچھ کام نہیں آیا۔ بس رات بھر بیٹھا رہا۔
*I gave him every argument. Nothing worked. I just sat there all night.*

**SAIN**
دلیل دماغ تک جاتی ہے۔ ساتھ دل تک۔
*An argument reaches the mind. Company reaches the heart.*

Title: **گراوٹ — FREEFALL. ورع — WARA'.**

**Depths**
- *Clear:* Burhan learned that staying matters more than winning.
- *Deep:* Restraint for himself, company for others. The second pillar, *islah*, starts with your own limits.
- *Deepest:* Sain's line is the whole of chapter 2 in eight words.

---

**Notes for this script**
- **No music at the party.** Its sound is voices, laughter and phone chimes.
- **The dragon has no face.** It's a coil of smoke and stone; animals and creatures default to featureless until the ulama answer.
- **Rumi.** The parable and the Persian couplet are from the Masnavi, Book 3. Rumi's Urdu lines are written for the game.
- **To confirm with ulama:** Rumi shown as a featureless figure (see the bible).


## Chapter 3: The Hunger

**Chapter 3: The Hunger.** Draft 1. About 35 minutes. Part of the story bible (Part 2).

- **Veil:** calls itself *Plenty*; its true name, spoken in Urdu, is **بھوک** (subtitle: *The Hunger*). It stands for consumerism and capitalism.
- **Station:** *Zuhd* (renunciation).
- **Guides:** Baba Farid, then Nizamuddin Auliya.
- **Pillar:** Khidmat e Khalq, serving creation.
- **New action:** durood.
- **Shape:** Islamabad (scenes 1–5) → the Gilding (6) → the visions (7–8) → the grave (9).

The format is the same as chapter 1.

---

### Scene 1: Eleven-eleven
**Where:** "The Pinnacle," a giant mall in Blue Area, on the night of its 11.11 sale. A countdown clock fills the atrium and crowds press against the shutters.
**Who:** BURHAN, FARAZ (SURAT sponsors the sale), and the mall's PA voice, which speaks English.
**Play:** You walk the atrium with Faraz. Faraz offers Burhan a voucher, and the player can take it or refuse it. If he takes it, the Hunger's swarm in scene 6 is bigger.

**PA VOICE (English)**
*"Ten minutes to Eleven-Eleven! Everything must go!"*

**FARAZ**
گیارہ گیارہ۔ سال کا سب سے بڑا دن۔ آج لوگ وہ خریدیں گے جس کی انہیں ضرورت نہیں، ان پیسوں سے جو ان کے پاس نہیں۔
*Eleven-eleven. Biggest day of the year. Today people buy what they don't need, with money they don't have.*

**BURHAN**
اور آپ کو یہ ٹھیک لگتا ہے؟
*And that seems right to you?*

**FARAZ**
ٹھیک غلط کا مجھے نہیں پتا، چھوٹے۔ گروتھ کا پتا ہے۔
*I don't know about right and wrong, little brother. I know growth.*

**FARAZ** *(holding out a gold card)*
یہ لو۔ سُورت کی طرف سے۔ کچھ اپنے لیے لے لو۔ تم بھی تو انسان ہو۔
*Here. From SURAT. Buy something for yourself. You're human too.*

**Depths**
- *Clear:* A sale built to make people buy what they don't need.
- *Deep:* Consumer capitalism needs people to stay unsatisfied, and growth is its only measure. Faraz knows exactly what he sells and says so cheerfully.
- *Deepest:* "Rivalry in more distracted you" (102:1). The man who knows the trick still serves it.

---

### Scene 2: The offer
**Where:** A roadside restaurant in G-9 Markaz. Evening.
**Who:** BURHAN, ABBA (in Islamabad for the day), CHAUDHRY SAHIB (a property dealer and Abba's old friend), AMMI (on speakerphone, voice only).

**CHAUDHRY**
بھائی صاحب، زر گارڈنز کا لانچ ہے۔ آفر سنیں: فجر سے مغرب تک جتنی زمین کے گرد چکر لگا لیں، ایک ہی قیمت میں آپ کی۔
*Bhai sahib, it's the launch of Zar Gardens. Hear the offer: as much land as you can walk around between Fajr and Maghrib — yours, for one price.*

**ABBA**
برہان کی اسکالرشپ کے پیسے پڑے ہیں۔ دگنے ہو جائیں گے۔
*Burhan's scholarship money is just sitting there. It'll double.*

**BURHAN**
ابو، وہ پیسے...
*Abbu, that money...*

**ABBA**
تم پڑھائی کرو، کاروبار ہمیں سمجھنے دو۔
*You study. Let us handle business.*

**CHAUDHRY**
میں خود چلوں گا آپ کی طرف سے۔ کل فجر سے۔ زمین بھاگنے والوں کی ہوتی ہے، بھائی صاحب!
*I'll walk it myself on your behalf, from Fajr tomorrow. Land belongs to those who run, bhai sahib!*

Abba's phone rings, and he puts it on speaker.

**AMMI** *(phone)*
برہان کو کہیں کھانا ٹھیک سے کھائے۔ اور بیٹا، پریشانی ہو تو درود پڑھا کرو۔
*Tell Burhan to eat properly. And beta, when you're troubled, recite durood.*

**Depths**
- *Clear:* Abba wants the money to grow, and Chaudhry is happy to oblige.
- *Deep:* The housing-society boom: land as gambling, savings turned into plots no one will ever live on.
- *Deepest:* The offer is Tolstoy's parable *How Much Land Does a Man Need?*, retold as a Pakistani launch deal. Ammi's line plants the chapter's new action.

---

### Scene 3: The walk
**Where:** The Zar Gardens site beyond the motorway: bare hills, survey pegs and a huge golden gate. It runs from Fajr to Maghrib.
**Who:** BURHAN, CHAUDHRY SAHIB, a GRAVEDIGGER.
**Play:** You follow Chaudhry across the land as he drives stakes, carrying his water and pleading with him to stop. The sun crosses the sky in a time-lapse, marked by each prayer time. You can't stop him, and you're not meant to.

**CHAUDHRY** *(morning, cheerful)*
دیکھ برہان، وہ ٹیلہ بھی لے لیتے ہیں۔ وہاں سے مارگلہ نظر آتا ہے۔ ریٹ ڈبل۔
*Look, Burhan, let's take that hillock too. You can see the Margallas from there. Double the rate.*

Zuhr.

**BURHAN**
چوہدری صاحب، بس کریں! ظہر نکل رہی ہے!
*Chaudhry sahib, stop! Zuhr is passing!*

**CHAUDHRY**
نماز بعد میں، زمین ابھی!
*Prayer later — land now!*

Asr. He's panting, his shirt soaked through.

**CHAUDHRY**
بس ایک کنال اور... بس ایک اور...
*Just one more kanal... just one more...*

Maghrib. The sun touches the hills. He runs for the last stake, reaches it, and falls.

**CHAUDHRY**
پہنچ... گیا...
*Made... it...*

He dies there, with his hand on the stake.

The next afternoon, in a village graveyard, the gravedigger straightens up from the hole.

**GRAVEDIGGER**
لمبائی چھ فٹ، چوڑائی تین۔ بس اتنی ہی چاہیے تھی۔
*Six feet long, three wide. That's all he needed.*

**Depths**
- *Clear:* He wanted all the land and got six feet.
- *Deep:* Greed has no finish line. Prayer is always postponed for one more deal.
- *Deepest:* "Rivalry in more distracted you, until you visited the graves" (102:1–2). Tolstoy ends his story the same way: six feet was all the man needed.

---

### Scene 4: The ward
**Where:** A general ward at PIMS, where Azad is recovering. Afternoon.
**Who:** BURHAN, AZAD, an OLD MAN dying in the next bed, and his SON.
**Play:** None. You sit and watch.

**SON** *(holding his father's hand)*
لا الٰہ الا اللہ... ابو، کہیں: لا الٰہ الا اللہ...
*La ilaha illallah... Abbu, say it: la ilaha illallah...*

**OLD MAN**
میرا فون... میرا فون دو...
*My phone... give me my phone...*

Crying, the son puts the phone in his hand. Its light falls on the old man's smooth face. He dies holding it.

**AZAD** *(quietly)*
یار... یہ میں بھی ہو سکتا تھا۔
*Man... that could have been me.*

**BURHAN**
ابھی بھی ہو سکتے ہیں۔ ہم سب۔
*It still could be. Any of us.*

**Depths**
- *Clear:* At the very end, he reached for his phone, not his Lord.
- *Deep:* The attention economy owns even our last minute. A habit made over a lifetime is what the hand reaches for.
- *Deepest:* "Every servant will be raised on what he died upon" (Muslim).

---

### Scene 5: The chai stall
**Where:** A chai stall outside The Pinnacle, on the night of the sale.
**Who:** BURHAN, KHAN CHACHA (the old owner), TWO ROBBERS with knives.
**Play:** A protective fight. Burhan has been learning, and if he fights in control the mirror brightens on its own.

**ROBBER**
گلہ خالی کر، بڈھے! آج سیل ہے!
*Empty the till, old man! It's sale day!*

They fight, and the robbers run.

**KHAN CHACHA**
اللہ تمہیں خوش رکھے، بیٹا! چائے پی کے جانا!
*May Allah keep you happy, son! Have some tea before you go!*

Burhan drinks the tea and leaves money under the cup without saying anything.

**Depths**
- *Clear:* Protect the weak and ask nothing back.
- *Deep:* *Khidmat e khalq* (serving creation) is one of the four pillars. Service done for no reward is the opposite of the market.
- *Deepest:* The money under the cup is the chapter's station in one small act: *zuhd* begins in the hand.

---

### Scene 6: The mall-temple (the Gilding)
**Where:** The Pinnacle, now in the Gilding: a cathedral of gold.
- Shoppers with screen faces kneel before display cases.
- A giant countdown clock ticks over the atrium.
- A swarm of glittering wants floats in the air: shoes, phones, watches, keys.

**Who:** BURHAN, PLENTY (a figure in a golden suit whose screen face shows a price tag that never stops climbing).
**Play:**
- The swarm follows Burhan, and each want he touches splits into ten more.
- Zikr slows the swarm but doesn't scatter it.
- Then comes the new action: **Durood**. It brings a light that returns tenfold.
- The countdown chime is a plain tone, never a parody of the azan.

**PLENTY**
تمہیں اور چاہیے۔ تم اس کے حقدار ہو۔
*You need more. You deserve it.*

**PLENTY**
تم جو خریدتے ہو، وہی تم ہو۔
*You are what you buy.*

The swarm closes in. Ammi's voice echoes from scene 2:

**AMMI** *(echo)*
پریشانی ہو تو درود پڑھا کرو۔
*When you're troubled, recite durood.*

Prompt: **Durood — a light that returns tenfold.**

**BURHAN**
اللّٰهُمَّ صَلِّ عَلٰى مُحَمَّدٍ وَّعَلٰى اٰلِ مُحَمَّدٍ
*O Allah, send blessings upon Muhammad and the family of Muhammad.*

Each blessing breaks into ten points of light, and each point shatters a want. The gold atrium dims. The countdown clock stops at 00:00:00. Burhan sinks to his knees in the light, and the floor opens into the chain.

**Depths**
- *Clear:* Wanting more never ends, and every purchase breeds the next want.
- *Deep:* Advertising manufactures desire and sells it back to you. Shopping becomes a religion, with its own festivals, prayers and kneeling.
- *Deepest:* "Whoever sends one blessing upon me, Allah sends ten upon him" (Muslim). Takathur multiplies wants; durood multiplies light. That is the true increase.

---

### Scene 7: The langar (vision)
**Where:** Ajodhan (today's Pakpattan), around 1250. Baba Farid's khanqah, a long mud-walled kitchen with a queue of the poor stretching out of the gate.
**Who:** BABA FARID (old, in plain clothes, eating dry bread, featureless), the HUNGRY in the queue, BURHAN.
**Play:** Service. Burhan ladles lentils and hands out bread to each person in the queue. There's no score and no reward, only the line getting shorter.

**BABA FARID** *(in Punjabi)*
رُکھی سُکھی کھا کے ٹھنڈا پانی پی
فریدا ویکھ پرائی چوپڑی نہ ترسائیں جی
*Eat your dry bread and drink cold water;*
*Farid, seeing another's buttered bread, don't let your heart crave.*

**BABA FARID**
لنگر میں کوئی بیچتا نہیں، کوئی خریدتا نہیں۔ اسی لیے یہاں کوئی بھوکا نہیں رہتا۔
*In the langar no one sells and no one buys. That's why no one here goes hungry.*

**BURHAN**
مگر بازار کہتا ہے چیزیں کم ہیں، اسی لیے قیمت ہے۔
*But the market says things are scarce, and that's why there are prices.*

**BABA FARID**
کمی پیٹ کی نہیں، دل کی ہے۔ پیٹ دو روٹیوں سے بھر جاتا ہے۔ دل سونے کے دو پہاڑوں سے بھی نہیں بھرتا۔
*The lack isn't in the belly; it's in the heart. A belly fills with two loaves. A heart doesn't fill even with two mountains of gold.*

**Depths**
- *Clear:* The saint ate dry bread and fed everyone.
- *Deep:* An economy of giving stands against an economy of wanting. *Zuhd* is not poverty; it is freedom from craving.
- *Deepest:* Baba Farid's "two mountains of gold" echoes the hadith: "If the son of Adam had two valleys of wealth, he would want a third" (Bukhari).

---

### Scene 8: Two doors (vision)
**Where:** Ghiyaspur, near Delhi, about 1320. Nizamuddin Auliya's khanqah by the Yamuna, where the kitchen fires burn day and night.
**Who:** NIZAMUDDIN AULIYA (old, in white, featureless), a SULTAN'S MESSENGER carrying trays of gold, the poor, BURHAN.
**Play:** You watch the gold handed out before the messenger has even finished speaking.

**NIZAMUDDIN** *(to his attendants)*
یہ سب ابھی بانٹ دو۔ رات تک خانقاہ میں ایک سکہ نہ رہے۔
*Give all of this away now. By nightfall, not one coin stays in the khanqah.*

**MESSENGER**
سلطان ملاقات کو آنا چاہتے ہیں۔
*The Sultan wishes to visit.*

**NIZAMUDDIN**
میری خانقاہ کے دو دروازے ہیں۔ اگر سلطان ایک سے آئیں گے، تو میں دوسرے سے نکل جاؤں گا۔
*My khanqah has two doors. If the Sultan comes in by one, I will leave by the other.*

**Depths**
- *Clear:* He gave away every coin and wanted nothing from the king.
- *Deep:* The saints kept away from wealth and power because both feed the hunger. Service to creation needs a heart that wants nothing from it.
- *Deepest:* The two doors are tradition. The kitchen that never closed is history.

---

### Scene 9: The grave
**Where:** Chaudhry Sahib's grave in the village graveyard. Evening.
**Who:** BURHAN, ABBA.
**Play:** Burhan holds out the envelope to Abba, then the last kashf.

**BURHAN**
ابو، یہ پیسے واپس۔ زمین میں نہیں، کسی بھوکے کے لنگر میں لگا دیں۔
*Abbu, here's the money back. Put it into a langar for the hungry, not into land.*

**ABBA**
تم پاگل ہو گئے ہو؟
*Have you gone mad?*

**BURHAN**
شاید۔ مگر چوہدری صاحب کو چھ فٹ ہی ملے۔
*Maybe. But Chaudhry sahib only got six feet.*

Abba says nothing. He takes the envelope and looks at the grave for a long time.

The Gilding flickers at the grave's edge. Plenty stands there, its price tag still climbing.

**Kashf.** The price tag cracks. Under the English mask *PLENTY*, one Urdu word shows through: **بھوک**. Subtitle: *THE HUNGER*.

**THE HUNGER** *(its true voice, hollow)*
میں کبھی نہیں بھرتا۔ صرف مٹی مجھے چپ کراتی ہے۔
*I am never full. Only earth silences me.*

**BURHAN**
رسول اللہ ﷺ نے فرمایا: ابنِ آدم کا پیٹ مٹی کے سوا کوئی چیز نہیں بھرتی۔
*The Messenger of Allah ﷺ said: nothing fills the son of Adam but dust.*

Title: **بھوک — THE HUNGER. زہد — ZUHD.** A second small light glows at the right of Burhan's chest. This is the second latifa, **ruh**.

**Depths**
- *Clear:* Burhan gives the money back, and the Hunger falls silent at a grave.
- *Deep:* Zuhd means turning down the market's offer even when it comes from your own father, and doing it with respect.
- *Deepest:* "Nothing fills the belly of the son of Adam but dust" (Bukhari). The grave is the only thing that satisfies the hunger.

---

**Notes for this script**
- **No azan parody.** The mall's countdown chime is a plain tone, never a call to prayer.
- **Scenes and lines with sources:**
  - Chaudhry's walk reframes Tolstoy's *How Much Land Does a Man Need?* (1886).
  - Baba Farid's couplet is his own, in Punjabi.
  - Nizamuddin Auliya's "two doors" comes from tradition.
  - Durood follows the opening of the Durood Ibrahimi.
  - The hadiths are from Bukhari and Muslim, and the Prophet ﷺ is quoted by Burhan, never voiced.
- **Names are fictional:** "The Pinnacle" and "Zar Gardens" (*zar* means gold).
- **To confirm with ulama:** Baba Farid and Nizamuddin Auliya shown as featureless figures.


## Chapter 4: The Slow Descent

**Chapter 4: The Slow Descent.** Draft 1. About 50 minutes; this is the game's midpoint. Part of the story bible (Part 2).

- **Veil:** calls itself *Progress*; its true name, spoken in Urdu, is **اترائی** (subtitle: *The Slow Descent*). It stands for modernism.
- **Station:** *Faqr* (need of Allah).
- **Guides:** Imam Ghazali, then Ibn Rushd.
- **Pillar:** Taleem o Taalum, learning.
- **Big reveals:**
  - Burhan loses his voice.
  - His name was stolen.
  - The upgrade tree is a staircase down.
  - Sain is Professor Hadi.
- **Shape:**
  - The journey with Sain (scenes 1–4).
  - The championship (5).
  - The Gilding (6).
  - The visions (7–9).
  - The Gilding again (10).
  - Saidpur (11–13).

The format is the same as chapter 1.

---

### Scene 1: The condition
**Where:** The small mosque near the caves, just after Fajr.
**Who:** BURHAN, SAIN.

**SAIN**
تین دن میرے ساتھ چلو گے؟
*Will you walk with me for three days?*

**BURHAN**
کہاں؟
*Where?*

**SAIN**
جہاں راستہ لے جائے۔ ایک شرط ہے: جب تک میں نہ بتاؤں، کیوں مت پوچھنا۔
*Wherever the road goes. One condition: don't ask why until I tell you.*

**BURHAN**
منظور۔
*Agreed.*

**Depths**
- *Clear:* Sain asks for trust before he explains anything.
- *Deep:* Some knowledge only comes after patience. You can't argue your way to it.
- *Deepest:* This is the condition the hidden teacher sets in Surah Al-Kahf: "ask me about nothing until I mention it to you" (18:70). The next three acts follow that story with ordinary people.

---

### Scene 2: The phone
**Where:** A ridge path in the Margallas. Morning.
**Play:** Walking. Burhan's phone keeps pinging with SURAT notifications.

Sain stops, holds out his hand, and Burhan gives him the phone. Sain smashes it on a rock.

**BURHAN**
یہ کیا کیا آپ نے؟!
*What did you just do?!*

**SAIN**
ابھی نہیں۔
*Not yet.*

**Depths**
- *Clear:* Something precious is broken for no reason Burhan can see.
- *Deep:* The phone is how the modern world goes everywhere with you.
- *Deepest:* In Al-Kahf, the boat is damaged to save it from a king who seized every sound boat. Its explanation comes in scene 12.

---

### Scene 3: The chai stall
**Where:** A roadside dhaba on the Murree road. Afternoon.
**Who:** BURHAN, SAIN, an OLD MAN (a retired clerk).
**Play:** The wheel opens, and Burhan's best proof line is lit and ready. Before the player can choose it, Sain's hand lands on his shoulder and the wheel closes.

**OLD MAN**
نماز سے کیا ملتا ہے؟ میں نے چالیس سال نوکری کی، نماز کے بغیر۔ کیا بگڑا؟
*What does prayer get you? I worked forty years without praying. What went wrong?*

The wheel closes. Sain pays for the old man's tea and walks on. Burhan catches him up on the road.

**BURHAN**
میں جیت رہا تھا!
*I was winning!*

**SAIN**
ابھی نہیں۔
*Not yet.*

**Depths**
- *Clear:* Sain stopped Burhan from winning an argument.
- *Deep:* Winning an argument and winning a person are different things, and sometimes the first destroys the second.
- *Deepest:* The second act of the hidden teacher. Its meaning comes in scene 12.

---

### Scene 4: The wall
**Where:** Saidpur village at the foot of the Margallas. From evening through the night.
**Who:** BURHAN, SAIN, VILLAGERS.
**Play:**
- The villagers turn them away.
- Sain finds a crumbling old wall at the edge of one courtyard.
- All night, the player carries stones while Sain sets them in place.

**BURHAN** *(to a villager)*
پانی مل سکتا ہے؟ ہم صبح سے چل رہے ہیں۔
*Could we have some water? We've been walking since morning.*

**VILLAGER**
یہاں سیاحوں کو مفت کچھ نہیں ملتا۔
*Tourists get nothing free here.*

Sain is already lifting the first stone.

**BURHAN**
ان لوگوں نے پانی تک نہیں دیا، اور آپ ان کی دیوار بنا رہے ہیں؟ کم از کم مزدوری تو مانگ لیں!
*These people wouldn't even give us water, and you're building their wall? At least ask for wages!*

**SAIN**
ابھی نہیں۔
*Not yet.*

**Depths**
- *Clear:* Sain serves people who refused to serve him.
- *Deep:* *Khidmat* (service) that waits for a return is only trade.
- *Deepest:* In Al-Kahf, Musa says "if you wished, you could have taken a wage for it" (18:77). Here Burhan says the same thing.

---

### Scene 5: The championship
**Where:** A national TV studio. Faraz's network is broadcasting the National Debate Championship.
**Who:**
- BURHAN
- REHAN (the opponent again)
- THE HOST, a young tech-optimist in a hoodie. In the real world he is just a man, but he wears Progress's mask.
- FARAZ, in the sponsor's box
- A live audience

**Play:** The wheel opens as usual. Every option Burhan picks produces silence. His subtitle reads only *(…)*. The crowd starts to murmur.

**HOST**
آج کی قرارداد: یہ ایوان سمجھتا ہے کہ ترقی نے ہمیں بہتر انسان بنایا ہے۔
*Tonight's motion: This house believes progress has made us better people.*

**REHAN**
ہم پہلے سے زیادہ جیتے ہیں، زیادہ جانتے ہیں، زیادہ آزاد ہیں۔ ترقی نے ہمیں بہتر بنایا ہے۔
*We live longer, know more and are freer than ever. Progress has made us better.*

The wheel opens and Burhan chooses. Nothing comes out. He tries again, and again there's nothing.

**HOST** *(laughing)*
ایک منٹ دیتے ہیں انہیں، فوکس۔ بیسٹ کو بھی کبھی کبھی اپ ڈیٹ چاہیے ہوتی ہے۔
*Let's give him a minute, folks. Even the best need an update sometimes.*

**FARAZ** *(from the box, under his breath)*
چلو، چھوٹے...
*Come on, little brother...*

Burhan puts down the microphone and walks off the stage in silence.

**Depths**
- *Clear:* The champion debater loses his voice on the biggest night of his life.
- *Deep:* The lie "proof is enough" breaks in public. The motion itself is the Slow Descent's mask: longer, faster, more, and calling it better.
- *Deepest:* Imam Ghazali's tongue locked in front of his students in 1095. Burhan is about to meet him.

---

### Scene 6: The escalators (the Gilding)
**Where:** An endless golden mall of escalators that all go up, and up.
**Who:** BURHAN (still voiceless), PROGRESS (a sleek figure in a hoodie whose screen face shows a loading bar stuck at 99%).
**Play:** The reveal of the upgrade tree.
- The upgrades the player has been unlocking since chapter 1 (speed, influence, followers) light up one by one as escalator steps.
- Then a new gauge appears on the screen: **TRUE ELEVATION: −1,240 m**. They have been going down the whole time.
- Burhan tries to climb back, but the escalator outruns him and he falls.

**PROGRESS**
اپ گریڈ کرو۔ تمہیں بہتر ہونے کا حق ہے۔
*Upgrade. You deserve to be better.*

**PROGRESS**
ہر سال نیا ورژن۔ ہر سال تھوڑا اور اوپر۔
*A new version every year. A little higher every year.*

**PROGRESS** *(as the gauge appears)*
اوپر جانے کا احساس ہی تو اصل اوپر جانا ہے۔
*The feeling of going up is what going up really is.*

Burhan, exhausted and voiceless, sinks down on a step. Breath: *Allah*, *Hu*. The chain opens.

**Depths**
- *Clear:* Every upgrade felt like rising. They were sinking.
- *Deep:*
  - "Progress" is not moral improvement, and convenience has a cost.
  - The game turns this critique on its own reward loop: the player's own upgrades were the staircase down.
- *Deepest:* "We will lead them on step by step, from where they do not know" (7:182). This is *istidraj*.

---

### Scene 7: Baghdad, 1095 (vision)
**Where:** The Nizamiyya college in Baghdad. A hall of three hundred students, then a bare room at night.
**Who:** IMAM GHAZALI (featureless, in a scholar's turban, known by his silhouette and voice), STUDENTS, PHYSICIANS, BURHAN (voiceless).
**Play:** Burhan watches the most famous teacher of his age fall silent, the way he just did. Burhan cannot speak. Ghazali speaks to him anyway.

In the hall, Ghazali opens his mouth to teach and nothing comes. The students whisper. Later, in a side room:

**A PHYSICIAN**
بیماری جسم میں نہیں، دل میں ہے۔ دل کو فکر سے آرام ملے گا تو زبان کھلے گی۔
*The illness isn't in the body; it's in the heart. When the heart finds rest from its worry, the tongue will open.*

Night. Ghazali is folding a plain wool cloak. He sees Burhan at the door.

**GHAZALI**
بولنے کی ضرورت نہیں۔ میں بھی چپ ہو گیا تھا۔
*No need to speak. I fell silent too.*

**GHAZALI**
میں اس زمانے کا سب سے بڑا مدرس تھا۔ مگر جب اپنے دل میں جھانکا تو دیکھا: نیت اللہ کی نہیں، شہرت کی تھی۔
*I was the greatest teacher of my age. But when I looked into my heart, I saw it: my intention was not for Allah, but for fame.*

**GHAZALI**
علم نے مجھے دروازے تک پہنچایا۔ اندر جانے کے لیے مجھے سب کچھ چھوڑنا پڑا۔
*Knowledge brought me to the door. To go in, I had to leave everything.*

He walks out through the city gate in the dark, carrying nothing.

**Depths**
- *Clear:* The greatest scholar of his age lost his voice, saw why, and walked away from fame.
- *Deep:* Knowing about God isn't knowing God, and learning done for prestige rots from inside.
- *Deepest:* Ghazali describes his locked tongue, the physicians' verdict and his departure in his own account, *Deliverance from Error*. His lines here are written for the game.

---

### Scene 8: Cordoba (vision)
**Where:** Cordoba in the 1190s: the courtyard of orange trees beside the great mosque, and a library with its doors open to the sun.
**Who:** IBN RUSHD (a judge and philosopher, featureless, surrounded by books), BURHAN.
**Play:** **Burhan's voice comes back.**

**IBN RUSHD**
یہاں دلیل کی زبان کھلتی ہے۔ بولو۔
*Here the tongue of reason opens. Speak.*

**BURHAN** *(his first words since the studio)*
میرا نام... برہان ہے۔
*My name... is Burhan.*

**IBN RUSHD** *(amused)*
دلیل۔ اچھا نام ہے۔
*Proof. A good name.*

**IBN RUSHD**
حق، حق کا مخالف نہیں ہوتا؛ بلکہ اس کی موافقت کرتا اور اس کی گواہی دیتا ہے۔
*Truth does not oppose truth; it agrees with it and bears witness to it.*

**BURHAN**
پھر مغرب نے دلیل کو دین سے الگ کیوں کر دیا؟
*Then why did the West split reason from religion?*

**IBN RUSHD**
میں نے کہا تھا: حق، حق کا مخالف نہیں ہوتا۔ انہوں نے سنا: دو حق ہیں۔
*I said: truth does not oppose truth. They heard: there are two truths.*

He takes Burhan's hand and leads him through the library door into another century.

**Depths**
- *Clear:* A Muslim judge taught that reason and revelation agree.
- *Deep:* Reason was never the enemy of faith. Reason cut off from revelation is.
- *Deepest:* "Truth does not oppose truth" is Ibn Rushd's own principle, from *Fasl al-Maqal* ("The Decisive Treatise"). The word he used for demonstrative proof is *burhan*.

---

### Scene 9: Paris, 1270s (vision)
**Where:** A stone lecture hall in Paris, then a scribe's desk.
**Who:**
- A MASTER lecturing in Latin.
- STUDENTS.
- A HERALD reading the bishop's condemnation of 1277.
- A SCRIBE.
- BURHAN and IBN RUSHD, unseen by the others.

**Play:** Walking and watching. The people here are scholars at work, shown as they were. The scene is about what happened to an idea, not about the people.

**MASTER** *(Latin)*
Hoc verum est secundum philosophiam, sed non secundum fidem.
*This is true according to philosophy, but not according to faith.*

**HERALD** *(Latin, reading from the condemnation)*
...quasi sint duae contrariae veritates.
*...as if there were two contrary truths.*

At the scribe's desk, a copy is being made. The name **Ibn Rushd** fades from the page and becomes **Averroes**. Another manuscript falls open at its first line: ***Dixit Algorizmi***, "thus spoke al-Khwarizmi." The word *algorithm* lifts off the page and rises like gold leaf into a gold sky.

**IBN RUSHD** *(quietly)*
انہوں نے ہمارے نام لیے، اور ان سے وحی نکال دی۔
*They took our names, and took the revelation out of them.*

**Depths**
- *Clear:* Ideas born among Muslims went West and lost their roots on the way.
- *Deep:* Europe's "Averroists" were accused of teaching two truths, one for reason and one for faith. That was an early seed of the split that became secularism.
- *Deepest:* Burhan's name was stolen. The Gilding's code is written in a Muslim mathematician's Latinized name, *algorithm*, from *Algorizmi*.

---

### Scene 10: Giving back (the Gilding)
**Where:** The escalators again.
**Play:** **The *faqr* mechanic.**
- Prompt: **Give back.**
- Burhan returns his upgrades one by one: speed, influence, followers.
- Each one he gives up lifts the whole escalator.
- The true-elevation gauge climbs toward zero, then above it for the first time.

A recitation rises softly:

> يَا أَيُّهَا النَّاسُ أَنتُمُ الْفُقَرَاءُ إِلَى اللَّهِ
> *O mankind, you are the ones in need of Allah* (35:15)

**PROGRESS**
رکو! تم پیچھے جا رہے ہو!
*Stop! You're going backwards!*

**BURHAN**
نہیں۔ پہلی بار اوپر جا رہا ہوں۔
*No. For the first time, I'm going up.*

**Kashf.** The loading bar cracks at 99%. Under the English mask *PROGRESS*, one Urdu word shows through: **اترائی**. Subtitle: *THE SLOW DESCENT*.

**THE SLOW DESCENT** *(its true voice)*
میں نے تمہیں کبھی گرایا نہیں۔ بس ہر سیڑھی کو اوپر کا نام دیا۔
*I never made you fall. I only called every step "up."*

**Depths**
- *Clear:* Giving up the upgrades was the way up.
- *Deep:* Modern man feels self-sufficient, and the first revelation warned that man transgresses when he thinks himself self-sufficient (96:6–7).
- *Deepest:* *Faqr* is the station of knowing your need of Allah. It is the poverty that makes a person rich.

---

### Scene 11: The bulldozers
**Where:** Saidpur at dawn. Bulldozers stand at the edge of the old houses, under a banner: *SAIDPUR HERITAGE RESORT — by Zar Developers*.
**Who:** BURHAN, SAIN, the VILLAGERS (the same ones who refused them water), the DEVELOPERS' MEN with sticks.
**Play:** A fight. The villagers stand in front of their homes, and Burhan fights beside them, in control. The wall Sain built stands.

**DEVELOPER'S MAN**
ہٹ جاؤ! یہ ترقی ہے! یہاں ریزورٹ بنے گا!
*Move! This is progress! A resort's going up here!*

The fight. The bulldozers pull back.

**VILLAGER** *(the same man from scene 4)*
تم لوگ... ہمارے لیے لڑے؟ ہم نے تو تمہیں پانی تک نہیں دیا تھا۔
*You people... fought for us? We didn't even give you water.*

He goes inside and comes back with bread, water and a pot of saag.

**Depths**
- *Clear:* Burhan defends people who had refused him.
- *Deep:* "Progress" comes for the old village too, as a resort, as heritage turned into a product.
- *Deepest:* Service with no wage turns a hard heart. The villagers' food is the wage Burhan wanted in scene 4, and it came without asking.

---

### Scene 12: Under the wall
**Where:** Beside the rebuilt wall. Evening.
**Who:** BURHAN, SAIN. BILAL is sitting on top of the wall.
**Play:** The explanations, in the order of Al-Kahf.

**SAIN**
اب پوچھو۔
*Now ask.*

**BURHAN**
میرا فون؟
*My phone?*

**SAIN**
اس فون سے سُورت تمہیں دیکھ رہی تھی۔ تم جہاں جاتے، فراز کو پتا ہوتا۔
*SURAT was watching you through that phone. Wherever you went, Faraz knew.*

**BURHAN**
وہ بوڑھا؟
*The old man?*

**SAIN**
وہ کل فجر میں مسجد آنے والا تھا۔ اگر تم جیت جاتے، تو وہ ہار کر کبھی نہ آتا۔
*He was going to come to Fajr tomorrow. If you had won, he'd have lost — and never come.*

**BURHAN**
اور یہ دیوار؟
*And this wall?*

**SAIN**
یہ ایک یتیم کی ہے۔ اس کے باپ نے اس کے نیچے کچھ رکھا تھا۔ وقت آنے پر وہ خود نکالے گا۔
*It belongs to an orphan. His father left something under it. When the time comes, he'll take it out himself.*

Above them, Bilal swings his legs on the wall.

**BILAL**
اوئے ہیرو! تم یہاں کیا کر رہے ہو؟
*Oye, hero! What are you doing here?*

**BURHAN** *(looking from Bilal to Sain)*
تمہاری دیوار بنا رہے تھے۔
*Building your wall.*

**BILAL**
میری دیوار؟
*My wall?*

Sain only smiles.

**Depths**
- *Clear:* Each strange act had a reason Burhan couldn't see.
- *Deep:* We judge by what we can see, and the hidden is always larger.
- *Deepest:* The three explanations follow 18:79–82: the boat, the boy and the wall. The second is softened: here, what's saved is a man's return to prayer. "Their father was righteous" (18:82). The wall belongs to Bilal.

---

### Scene 13: The professor
**Where:** The village lane outside the wall. Night.
**Who:** BURHAN, SAIN, BABA REHMAT (an old villager).

**BABA REHMAT** *(peering at Sain)*
پروفیسر صاحب؟ آپ؟ تیس سال بعد؟
*Professor sahib? You? After thirty years?*

**BURHAN**
آپ... پروفیسر ہادی ہیں؟
*You... are Professor Hadi?*

**SAIN**
تھا۔
*I was.*

**BURHAN**
آپ نے سب کیوں چھوڑا؟
*Why did you leave it all?*

**SAIN**
آج بغداد میں تم نے کیا دیکھا؟
*What did you see in Baghdad today?*

Burhan has no answer, and he doesn't need one.

Title: **اترائی — THE SLOW DESCENT. فقر — FAQR.** A third light glows above the first, on the left of Burhan's chest. This is the third latifa, **sirr**.

**Depths**
- *Clear:* The old sweeper was the legendary debater all along.
- *Deep:* He left the stage the way Ghazali left Baghdad. He is a *malamati*, hiding his worth under a broom.
- *Deepest:* The trophy in chapter 1 carried his name. Second-time players saw it coming. "Hadi" means guide.

---

**Notes for this script**
- **Al-Kahf.** The three strange acts and their explanations follow the story of Musa and the hidden teacher (18:65–82), reframed with ordinary people. The second act is changed so that nothing is harmed. No prophet appears.
- **Sources for the visions:**
  - Ghazali's silence, the physicians' verdict and his departure are from his own *al-Munqidh min al-Dalal*.
  - "Truth does not oppose truth" is from Ibn Rushd's *Fasl al-Maqal*.
  - "As if there were two contrary truths" is from the Paris condemnation of 1277.
  - *Dixit Algorizmi* opens the Latin translation of al-Khwarizmi's arithmetic.
  - All other lines are written for the game.
- **The upgrade tree.** It must exist from chapter 1, offering real, useful upgrades, or the twist has no weight.
- **To confirm with ulama:** Ghazali and Ibn Rushd shown as featureless figures.


## Chapter 5: Foam

**Chapter 5: Foam.** Draft 1. About 45 minutes. Part of the story bible (Part 2).

- **Veil:** calls itself *Comfort*; its true name, spoken in Urdu, is **جھاگ** (subtitle: *Foam*). Its theme is the love of comfort: *wahn*.
- **Station:** *Sabr* (endurance).
- **Guides:** Ibn Khaldun, then Salahuddin Ayyubi. Optional side vision: Alp Arslan.
- **Pillars:** Tazkiah through *mujahada*; Taleem through teaching Bilal.
- **Shape:**
  - The relapse (scene 1)
  - The Gilding (2)
  - The visions (3–7)
  - The chilla and the akhara (8–9)
  - The park (10–11)
  - The Gilding again (12)

Format as in chapter 1.

---

### Scene 1: Soft days
**Where:** Burhan's hostel room, over several nights. A new phone (bought after chapter 4), the AC humming, food-delivery bags, a screen glowing at 3 a.m.
**Who:** BURHAN, COMFORT (a soft voice inside the AC hum and the phone's glow).
**Play:** A short montage of soft nights.
- On the last night, the Fajr alarm rings. Getting up is a slow, heavy input against Comfort's weight.
- The scene is scripted: whatever the player does, Burhan snoozes this once. Even after progress, comfort pulls back.

**COMFORT**
آرام کرو۔ تم نے بہت کچھ کیا ہے۔
*Rest. You've done so much.*

**COMFORT**
کل سے شروع کر لینا۔
*Start tomorrow.*

He wakes at ten to full sunlight and looks at the time.

**BURHAN**
فجر... پھر نکل گئی۔
*Fajr... gone again.*

**Depths**
- *Clear:* Comfort undoes progress quietly, one soft night at a time.
- *Deep:* Modern life is built to remove every hardship, and a soul with no hardship goes soft.
- *Deepest:* The veil never argues. It only says "tomorrow."

---

### Scene 2: The flood (the Gilding)
**Where:** Jinnah Avenue in the Gilding, flooded with golden water. On its surface floats a foam made of millions of screen-faced people, weightless and smiling, drifting wherever the current goes.
**Who:** BURHAN, COMFORT, and SAIN (an echo, remembered).
**Play:** The current carries Burhan, and he can't stand. Every attempt to plant his feet slides away.

**COMFORT**
بہاؤ کے ساتھ بہو۔ مقابلہ کیوں کرنا؟
*Go with the flow. Why resist?*

Sain's voice comes back to him from some earlier night:

**SAIN** *(echo)*
رسول اللہ ﷺ نے فرمایا تھا: قومیں تم پر ایسے ٹوٹ پڑیں گی جیسے کھانے والے پیالے پر۔ تم بہت ہو گے، مگر سیلاب کی جھاگ کی طرح۔
*The Messenger of Allah ﷺ said: the nations will fall upon you as diners fall upon a bowl. You will be many — but like the foam of a flood.*

**SAIN** *(echo)*
پوچھا گیا، یہ کمزوری کیا ہے؟ فرمایا: دنیا کی محبت اور موت کا ڈر۔
*He was asked: what is this weakness? He said: love of the world, and dislike of death.*

The foam closes over him. In the dark under the water, his breath finds *Allah... Hu*, and the chain opens.

**Depths**
- *Clear:* A crowd of millions with no weight, carried anywhere.
- *Deep:* Numbers mean nothing without spine. Comfort makes a people easy to move, and easy to rule.
- *Deepest:* The hadith of *wahn* (Abu Dawud). Sain narrates it; the Prophet ﷺ is never voiced.

---

### Scene 3: Granada, the 1360s (vision)
**Where:** The Alhambra in Granada. The Court of the Myrtles: a long still pool, carved plaster, silk, poets reciting at dusk.
**Who:** IBN KHALDUN (an envoy from the Maghrib, featureless), COURTIERS, POETS (recitation only, no instruments), BURHAN.
**Play:** You walk the palace with Ibn Khaldun. Everything is beautiful, and everything is soft.

**IBN KHALDUN**
عیش قوموں کی رگوں میں نیند بھر دیتا ہے۔ تیسری نسل تک تلوار زنگ کھا جاتی ہے۔
*Luxury pours sleep into a people's veins. By the third generation the sword has rusted.*

**IBN KHALDUN**
پہلی نسل بناتی ہے، دوسری سنبھالتی ہے، تیسری مزے کرتی ہے، چوتھی گنوا دیتی ہے۔
*The first generation builds, the second keeps, the third enjoys, the fourth loses it all.*

**BURHAN**
تو کیا یہ سب ختم ہو جائے گا؟
*So all of this will end?*

**IBN KHALDUN**
دیکھنا چاہو گے؟
*Do you want to see?*

**Depths**
- *Clear:* A great Muslim civilization grew soft in its own beauty.
- *Deep:* Ibn Khaldun's law of dynasties: hardship builds solidarity (*asabiyyah*), luxury dissolves it, and the fall follows within a few generations.
- *Deepest:* Ibn Khaldun really served at Granada's court in the 1360s. His lines here are written for the game from his *Muqaddimah*.

---

### Scene 4: Granada, 1492 (vision)
**Where:** A cold January dawn outside Granada's gates.
**Play:** A short cinematic with no dialogue.
- Granada's keys are held out on a cushion, and a gloved hand takes them.
- Church bells ring over the city.
- The last Muslim king rides away. On a hill, he turns and looks back.

Title card:
غرناطہ، ۲ جنوری ۱۴۹۲
*Granada, 2 January 1492*

**Depths**
- *Clear:* Granada fell. Comfort came first.
- *Deep:* The fourth generation lost what the first had built.
- *Deepest:* Ibn Khaldun served at this court about 130 years before its fall. The hill where the king looked back is still called "the Moor's sigh."

---

### Scene 5: Before Hattin, 1187 (vision)
**Where:** Salahuddin's camp, the night before the battle. A plain tent and hard ground.
**Who:** SALAHUDDIN AYYUBI (featureless, in plain armour, recognised by his bearing), SOLDIERS, BURHAN.
**Play:** Walking the camp, then the battle at the Horns of Hattin in July heat.
- The game holds the rules of war: the controls refuse to strike anyone who isn't fighting, and prisoners are taken, not killed.
- No gore.

**SALAHUDDIN**
میں کیسے مسکراؤں جب اقصیٰ قید میں ہے؟
*How can I smile while Al-Aqsa is in captivity?*

**SALAHUDDIN**
آرام کے بستر پر کوئی شہر آزاد نہیں ہوا۔
*No city was ever freed from a bed of comfort.*

The battle.

**Depths**
- *Clear:* A leader who refused comfort while his people's holy place was captive.
- *Deep:* Discipline is the opposite of foam, and *sabr* is a weapon.
- *Deepest:* "How can I smile while Al-Aqsa is captive" is tradition. Hattin is history.

---

### Scene 6: Jerusalem, October 1187 (vision)
**Where:** The gates of Jerusalem after its surrender.
**Who:** SALAHUDDIN, the city's people leaving under safe conduct, BURHAN.
**Play:** You walk through the gate as the defeated go out alive. Many are freed without ransom.

**SALAHUDDIN** *(watching the gate)*
اٹھاسی سال پہلے یہاں گلیوں میں خون بہا تھا۔ ہم وہ نہیں ہیں۔
*Eighty-eight years ago, blood ran in these streets. We are not them.*

**Depths**
- *Clear:* The victor spared the city.
- *Deep:* Islamic civilization at war, set against the massacre of 1099. The same words Kharal used in the prologue.
- *Deepest:* Strength and mercy are one thing in a believer. A soft people can do neither.

---

### Scene 7: Malazgirt, 1071 (optional side vision)
**Where:** The plain of Malazgirt before the battle.
**Who:** ALP ARSLAN (featureless, dressed in white and perfumed as for burial), his ARMY, BURHAN.
**Play:** Optional. It's found only by players who search the camp in scene 5 and find a white cloth folded in a corner.

**ALP ARSLAN**
اگر میں گر گیا تو یہی میرا کفن ہے۔
*If I fall, this is my shroud.*

He rides out at the head of the charge.

**Depths**
- *Clear:* A sultan who dressed for his own funeral before battle.
- *Deep:* The cure for *wahn*, the dislike of death, is a man who has already accepted it.
- *Deepest:* The white shroud and the perfume come from the chronicles. Treat them as tradition.

---

### Scene 8: The chilla
**Where:** The mountains above the Margallas, toward the Galiyat. There's a stone hut, and forty days pass in monsoon and cold.
**Who:** BURHAN, SAIN.
**Play:** A time-lapse of *mujahada*: climbing in rain, fasting, cold nights, tahajjud, and the breath. Burhan's body and movement visibly change across the days.

Back from the vision, at the small mosque:

**SAIN**
چالیس دن۔ پہاڑ۔ چلو گے؟
*Forty days. The mountains. Will you come?*

Day 1, on a steep wet slope:

**BURHAN**
میں تھک گیا ہوں۔
*I'm tired.*

**SAIN**
تھکن سے ہی تو جھاگ اترتی ہے۔
*Tiredness is how the foam comes off.*

Day 40. At dawn Burhan runs up the ridge ahead of Sain, and his smooth face catches the sunrise more brightly than ever before.

**SAIN** *(watching)*
اب پاؤں جم گئے۔
*Now your feet are planted.*

**Depths**
- *Clear:* Forty days of hardship gave Burhan back his feet.
- *Deep:* *Mujahada*, struggling against the self, breaks the soft shell that comfort grows. It is training, not punishment.
- *Deepest:* "The mujahid is the one who strives against his own self" (Tirmidhi). Forty days, *arba'in*, is the old measure of a *chilla*.

---

### Scene 9: The akhara
**Where:** An old wrestling pit in Rawalpindi: soft earth, the smell of oil and dust, a banyan overhead.
**Who:** BURHAN, PEHLWAN JI (an old wrestler), YOUNG WRESTLERS.
**Play:** The *kushti* tutorial: grips, balance, patience. Burhan is pinned again and again until he stops forcing it. Then he wins a bout by waiting.

**PEHLWAN JI**
کشتی زور کا نہیں، صبر کا کھیل ہے۔ جو غصے میں آیا، وہ چت ہوا۔
*Kushti isn't a game of strength; it's a game of patience. Whoever gets angry ends up on his back.*

After the win:

**PEHLWAN JI**
شاباش۔ اب مٹی تمہیں پہچانتی ہے۔
*Well done. Now the earth knows you.*

**Depths**
- *Clear:* Patience wins where force fails.
- *Deep:* The anger rule, mastered. The body has become a servant of the heart.
- *Deepest:* The Prophet ﷺ wrestled (tradition, about Rukana). "The strong believer is better and more beloved to Allah than the weak believer" (Muslim). The earth that "knows" him is the clay under the Gilding's gold.

---

### Scene 10: The circle in F-9 Park
**Where:** F-9 Park under the trees, in the late afternoon.
**Who:** BURHAN, BILAL, AZAD (recovering, helping), PARK KIDS, and passers-by filming on their phones.
**Play:** Teaching. Burhan runs the circle through the four pillars, each one a short activity:
- The breath zikr.
- A story from a book.
- Telling the truth when it costs you.
- Picking up the park's litter.

**BURHAN**
چار ستون: اصلاح و تزکیہ، تعلیم و تعلم، دعوت و تذکیر، خدمتِ خلق۔ دل میں ذکر، دماغ میں علم، زبان پر سچ، ہاتھ سے خدمت۔
*Four pillars: reform and purification, teaching and learning, inviting and reminding, serving creation. Remembrance in the heart, knowledge in the mind, truth on the tongue, service with the hands.*

**BILAL**
تم بدل گئے ہو، ہیرو۔
*You've changed, hero.*

**BURHAN**
ابھی بدل رہا ہوں۔
*Still changing.*

**AZAD** *(to Bilal)*
فجر میں میں جگاؤں گا تمہیں۔
*I'll wake you for Fajr.*

A passer-by lifts a phone to film Bilal. Bilal turns his back to it.

**BILAL**
میرا چہرہ نہیں، کام دکھاؤ۔
*Don't film my face — film the work.*

**Depths**
- *Clear:* Burhan is now raising others.
- *Deep:* The four pillars passed on. Azad, who was woken in chapter 2, now wakes someone else. The chain grows from person to person.
- *Deepest:* "The faceless boy of F-9 Park" begins here. Chapter 6 depends on it.

---

### Scene 11: The gang
**Where:** F-9 Park at dusk.
**Who:** BURHAN, BILAL, the DEALERS.
**Play:** A protective fight using kushti, fought in control. Burhan wins and lets them go, and the mirror brightens during the fight.

**DEALER 1**
بہت نیک بن گیا ہے؟ ہمارا مال کون بیچے گا؟
*Gone all pious, have you? Who'll sell our stuff now?*

The fight. The dealers pick themselves up and leave.

**Depths**
- *Clear:* Burhan protects Bilal, calmly.
- *Deep:* Strength in the service of others is *khidmat* with the hands.
- *Deepest:* The same dealers beat him on the trail in chapter 1. Now he can protect the boy who once stood up for him.

---

### Scene 12: Standing (the Gilding)
**Where:** The golden flood again.
**Play:** This time Burhan can stand. The current breaks around him like water around a rock. Behind him, Bilal, Azad and the park kids stand too, holding each other's shoulders.

**COMFORT** *(fading)*
بہاؤ... کے ساتھ...
*Go... with the...*

**Kashf.** Comfort's soft screen cracks. Under the English mask *COMFORT*, one Urdu word shows through: **جھاگ**. Subtitle: *FOAM*.

**FOAM** *(its true voice)*
میں نے کسی کو نہیں ڈبویا۔ میں نے بس... کھڑے رہنے کی وجہ چھین لی۔
*I drowned no one. I only... took away the reason to stand.*

The flood drains away, and the real park returns. Bilal throws his arms around Burhan.

**BILAL**
تم میرے ہیرو ہو۔
*You're my hero.*

For one frame, a hairline crack runs across Burhan's mirror-face. No one remarks on it.

Title: **جھاگ — FOAM. صبر — SABR.** A fourth light glows above the second, on the right of Burhan's chest. This is the fourth latifa, **khafi**.

**Depths**
- *Clear:* Burhan stands, and others stand with him.
- *Deep:* *Sabr* isn't waiting. It is standing while the world flows past.
- *Deepest:* Bilal's admiration feeds the last veil, "I". The hairline crack sets up chapter 7, and only attentive players will see it.

---

**Notes for this script**
- **No figurative statues.** The Alhambra scene uses the Court of the Myrtles and avoids the lion fountain, because of the owner's stance on statues.
- **Sources:**
  - The hadith of *wahn* is in Abu Dawud and is narrated by Sain.
  - Ibn Khaldun's theory is from the *Muqaddimah*; his lines are written for the game.
  - Salahuddin's "how can I smile" and Alp Arslan's shroud are tradition.
  - The surrender of Jerusalem and the freeing of many without ransom are history.
- **Women:** none appear on screen in the visions, pending the ulama.
- **To confirm with ulama:** Ibn Khaldun, Salahuddin and Alp Arslan shown as featureless figures.


## Chapter 6: The Facemaker

**Chapter 6: The Facemaker.** Draft 1. About 35 minutes. Part of the story bible (Part 2).

- **Veil:** calls itself *The Artist*. Its true name, spoken in Urdu, is **چہرہ ساز** (subtitle: *The Facemaker*). It is the human antagonist, Faraz.
- **Station:** *Tawakkul* (trust in Allah).
- **Guide:** Ibn al-Haytham.
- **Pillar:** Dawat o Tazkeer, the call.
- **Shape:**
  - Sain gone, and the wall (scenes 1–2)
  - Face Day announced (3)
  - The cost of faces (4–5)
  - The Gilding (6)
  - The vision (7)
  - Faraz (8)
  - The night before (9)

Format as in chapter 1.

---

### Scene 1: No azan
**Where:** The small mosque near the caves, at Fajr.
**Who:** BURHAN.
**Play:** Burhan climbs the hill at Fajr time, and for the first time there is no azan. The courtyard has been swept. Sain's broom leans against the wall. He waits. The time for Fajr is running out.

**BURHAN**
سائیں؟ سائیں!
*Sain? Sain!*

Nobody answers. Burhan climbs the few steps of the minaret and gives the azan himself, for the first time. His voice is shaky. This is a cinematic, never a prompt.

> اللّٰهُ أَكْبَرُ، اللّٰهُ أَكْبَرُ...
> *Allah is the Greatest, Allah is the Greatest...*

**Depths**
- *Clear:* Sain is gone, so Burhan calls the prayer himself.
- *Deep:* The call (*dawat*) passes from teacher to student when the teacher steps away.
- *Deepest:* Shams vanished from Rumi's life too. The murshid's absence is his last lesson.

---

### Scene 2: The wall
**Where:** Saidpur, at the wall Sain rebuilt. Morning.
**Who:**
- BURHAN
- BILAL
- BILAL'S CHACHA, his uncle and guardian
- BILAL'S FATHER, a man's voice reading his own letter

**Play:** Under the broom Burhan finds a folded note. In Saidpur, he and Bilal pry out the marked stone. Behind it is a tin box holding a zikr diary, a tasbih and letters.

**SAIN'S NOTE** *(his handwriting)*
دیوار کا وقت آ گیا۔
*The wall's time has come.*

Bilal opens the first letter. His father's voice reads it.

**BILAL'S FATHER** *(the letter)*
میرے بلال، جب بڑے ہو جاؤ تو سائیں کو ڈھونڈنا۔ وہ تمہیں وہ سکھائیں گے جو میں نہ سکھا سکا۔
*My Bilal, when you are grown, find Sain. He will teach you what I could not.*

**BILAL**
ابا سائیں کو جانتے تھے؟
*Abba knew Sain?*

**BURHAN**
سائیں سب کو جانتے ہیں۔
*Sain knows everyone.*

**BILAL** *(holding the tasbih)*
اور اب سائیں کہاں ہیں؟
*And where is Sain now?*

Burhan doesn't answer.

**Depths**
- *Clear:* The orphan's treasure was his father's faith.
- *Deep:* What a righteous parent leaves behind is not property. It is a path.
- *Deepest:* "Their father was righteous, so your Lord willed that they reach maturity and take out their treasure" (18:82). The Kahf story from chapter 4 is complete.

---

### Scene 3: Face Day
**Where:** Islamabad's billboards and screens, then a TV studio.
**Who:** The SURAT AD (English voiceover), FARAZ on a talk show.
**Play:** A montage across the city: bus stops, Blue Area towers, phone screens.

**SURAT AD (English)**
*"Face Day. Get the face you deserve. This Friday, 10 a.m., Parade Ground."*

**FARAZ** *(on the talk show)*
سُورت کا فیس اب صرف فلٹر نہیں۔ یہ آپ کی پہچان ہے۔ یونیورسٹیاں، دفتر، بینک، سب اسے مانیں گے۔
*SURAT's Face isn't just a filter anymore. It's your identity. Universities, offices, banks — all will accept it.*

**FARAZ**
اور ایک خاص دعوت: ایف نائن پارک کا وہ لڑکا جو کبھی چہرہ نہیں دکھاتا۔ بیٹا، جمعے کو اسٹیج پر آؤ۔ ہر ہیرو کو ایک چہرہ چاہیے۔
*And a special invitation: the boy from F-9 Park who never shows his face. Son, come to the stage on Friday. Every hero needs a face.*

**Depths**
- *Clear:* A company wants to give everyone a new face, and Faraz invites the faceless boy on stage.
- *Deep:* One digital identity that controls your studies, your work and your money is a quiet form of slavery.
- *Deepest:*
  - Face Day is set for Friday morning, before Jumu'ah. The Gilding's festival is placed over the believers' gathering.
  - Faraz's line echoes chapter 1: "every winner deserves a face the world remembers."

---

### Scene 4: The filtered marriage
**Where:** Burhan's hostel door, late at night.
**Who:** BURHAN, SAAD (Faraz's younger brother, Burhan's cousin, married six months ago). His wife is never seen.
**Play:** You sit with Saad and make him tea. That's the sohbat.

**SAAD**
اس نے کہا میں وہ نہیں ہوں جس سے اس نے شادی کی تھی۔ وہ ٹھیک کہتی ہے۔
*She said I'm not the man she married. She's right.*

**SAAD**
رشتہ ایپ پر دونوں کے چہرے سُورت کے تھے۔ آج ویڈیو کال پر فلٹر گر گیا۔ اسے میرا اصل چہرہ نظر آ گیا، مجھے اس کا۔
*On the rishta app, both our faces were SURAT's. Tonight on a video call the filter dropped. She saw my real face, and I saw hers.*

**SAAD**
چھ مہینے ہم نے دو اجنبیوں کی شادی نبھائی۔
*For six months we kept up a marriage between two strangers.*

**BURHAN**
اصل چہرے سے دوبارہ ملو۔ شاید پہلی بار ملو گے۔
*Meet her again, with your real face. Maybe it'll be the first time.*

**Depths**
- *Clear:* A marriage built on filtered faces breaks when the filters fail.
- *Deep:* When the self is a brand, marriage becomes a merger of two brands. That's why divorces come so fast.
- *Deepest:* Marriage depends on *ihsan*, being the same whether anyone is watching or not. The Facemaker's world has no unwatched moments.

---

### Scene 5: The city turns
**Where:** Phone feeds and talk shows, then F-9 Park at dusk.
**Who:** A TV ANCHOR, a MOB of young men filming on their phones, BURHAN, BILAL, the PARK KIDS.
**Play:** A montage of feed captions, in English and Urdu:
- *Why does he hide his face?*
- *Extremist?*
- *Backward mullah kid.*

Then a mob arrives and a protective fight begins. Burhan fights in control.

**ANCHOR**
یہ چہرہ چھپانے والے آخر چھپا کیا رہے ہیں؟
*What are these face-hiders actually hiding?*

The fight. The mob scatters, but someone's video of Burhan protecting the kids goes viral overnight. By morning he is "the faceless boy's mentor," and his own follower count is climbing.

**Depths**
- *Clear:* A city mocks the people who won't wear its faces.
- *Deep:* The old trick: call the believer backward, extremist, hiding something. It is the colonizer's sneer in a modern voice.
- *Deepest:* The viral video feeds the last veil. Burhan's hairline crack from chapter 5 grows longer, and no one mentions it.

---

### Scene 6: The Hall of Faces (the Gilding)
**Where:** Faraz's studio in the Gilding: a hall whose walls are made of screen-faces, every one smiling.
**Who:**
- BURHAN
- WHISPERS: screen-faced figures that drift toward him
- THE ARTIST: Faraz's mask, elegant, with a screen face showing a perfect face that never stops changing

**Play:** A fight.
- The whispers swarm, and Burhan's mirror-face throws their own light back at them. They see themselves and crack.
- The Artist can't be reflected, because his face changes too fast.
- Burhan is overwhelmed.

**THE ARTIST**
تم جیسا چاہو، ویسا دکھ سکتے ہو۔
*You can look however you want.*

**THE ARTIST**
سچ وہ ہے جو دکھتا ہے۔
*Truth is what is seen.*

The faces close in, and the hall goes white. In the white, Burhan finds his breath. The chain opens.

**Depths**
- *Clear:* A world where how you look is who you are.
- *Deep:* Images of nobody now replace the real: AI faces, filters, avatars. Followers become the currency of worth.
- *Deepest:* The hadith of the image-makers, "give life to what you created," is why this game's people have no faces.

---

### Scene 7: The dark room (vision)
**Where:** Cairo, about 1011–1021. A house near al-Azhar with guards outside. Inside is a room kept dark, with a single pinhole in the shutter.
**Who:** IBN AL-HAYTHAM (featureless; a scholar under house arrest), GUARDS, BURHAN.
**Play:**
- When the guards look in, Ibn al-Haytham acts mad: he laughs, talks to the walls, and drops his cup.
- When they leave, he works calmly.
- In the dark room, the street outside appears on the wall, upside down. People walk on the ceiling.
- The lesson becomes the mechanic for chapter 7: stop looking at the image and look at where the light comes from.

**IBN AL-HAYTHAM** *(once the guards are gone)*
اندھیرے کمرے میں تصویر ہمیشہ الٹی بنتی ہے۔ جو دنیا تمہیں اسکرین پر دکھائی جاتی ہے، وہ بھی۔
*In a dark room, the image always forms upside down. So does the world they show you on a screen.*

**IBN AL-HAYTHAM**
میں نے پاگل پن کا چہرہ پہنا تاکہ سچ بچا سکوں۔ وہ اپنا چہرہ پہنتے ہیں تاکہ سچ چھپا سکیں۔
*I wore the face of madness to save the truth. They wear their faces to hide it.*

**IBN AL-HAYTHAM**
جو آنکھ دیکھے، اسے بھی پرکھو۔
*Test even what your eye sees.*

**IBN AL-HAYTHAM** *(turning Burhan away from the wall, toward the pinhole)*
تصویر کو مت دیکھو۔ دیکھو روشنی کہاں سے آ رہی ہے۔
*Don't look at the image. Look at where the light is coming from.*

**Depths**
- *Clear:* Screens show the world upside down.
- *Deep:* The scientific method began with a Muslim who tested appearances instead of trusting them. Every camera descends from his dark room.
- *Deepest:*
  - "Allah is the Light of the heavens and the earth" (24:35). Look at the source, not the picture.
  - He hid his wisdom behind a mask of madness, which is the *malamati* way.
  - That he feigned madness is tradition. His work on optics is history.

---

### Scene 8: Faraz's office
**Where:** The top floor of SURAT's tower in Blue Area, at night. Glass walls look over the city's lights.
**Who:** BURHAN, FARAZ.
**Play:** A conversation, then the kashf, seen in a reflection.

**FARAZ** *(tired, sincere)*
میں لوگوں کو وہ دیتا ہوں جو وہ چاہتے ہیں۔ تم کیا دیتے ہو؟
*I give people what they want. What do you give?*

**BURHAN**
جو انہیں چاہیے۔
*What they need.*

**FARAZ**
چاہیے کا فیصلہ کون کرے گا؟ تم؟ تمہارا سائیں؟
*Who decides what they need? You? Your Sain?*

**BURHAN**
جس نے انہیں بنایا۔
*The One who made them.*

Faraz turns to the window. In the dark glass, his reflection flickers into the Gilding: the Artist's ever-changing face.

**Kashf.** The reflection cracks. Under the English mask *THE ARTIST*, two Urdu words show through: **چہرہ ساز**. Subtitle: *THE FACEMAKER*.

**THE FACEMAKER** *(Faraz's own voice, hollow, from the glass)*
میں نے ہزاروں چہرے بنائے۔ اپنا ایک بھی نہیں۔
*I made thousands of faces. Not one of my own.*

The reflection is gone. Faraz turns back, smiling again.

**FARAZ**
جمعے کو آنا، چھوٹے۔ اگلی صف میں تمہاری جگہ رکھی ہے۔
*Come on Friday, little brother. I've kept you a seat in the front row.*

**Depths**
- *Clear:* The man who makes everyone's face has no face of his own.
- *Deep:* The market gives people what they want, so it cannot see what they need. Only their Maker can define that.
- *Deepest:* "Allah, the Creator, the Maker, the Fashioner" (59:24). The image-maker imitates the One who gives every face its form. Faraz's front-row seat is bait for the last veil.

---

### Scene 9: The night before
**Where:** The small mosque near the caves. Thursday night.
**Who:** BURHAN, BILAL.
**Play:** A conversation. After it, Burhan watches Bilal walk down the hill alone.

The news on a neighbour's radio says the city will gather at the Parade Ground tomorrow. Bilal's name has been trending all day.

**BURHAN**
میں تمہارے ساتھ اسٹیج پر چلوں گا۔ فراز سے میں بات کروں گا۔ مجھے دلیل آتی ہے۔
*I'll come on stage with you. I'll talk to Faraz. I know how to argue.*

**BILAL**
تم نے کہا تھا، دل اللہ کے ساتھ رکھو، باقی وہ خود سنبھال لے گا۔
*You said: keep your heart with Allah, and He'll handle the rest.*

**BILAL**
یہ میرا کام ہے، ہیرو۔ تم دعا کرنا۔
*This is my job, hero. You pray.*

At the door, Bilal turns and recites the verse he learned in the circle:

> الَّذِينَ قَالَ لَهُمُ النَّاسُ إِنَّ النَّاسَ قَدْ جَمَعُوا لَكُمْ فَاخْشَوْهُمْ فَزَادَهُمْ إِيمَانًا وَقَالُوا حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ
> *Those to whom people said, "The people have gathered against you, so fear them" — it only increased them in faith, and they said, "Allah is enough for us, and He is the best to rely on."* (3:173)

He goes down the hill. Burhan stays at the door. On his mirror-face, the hairline crack has grown a little longer.

Title: **چہرہ ساز — THE FACEMAKER. توکل — TAWAKKUL.**

**Depths**
- *Clear:* The student goes to face the city. The teacher is asked to pray.
- *Deep:* *Tawakkul* is not passivity. It is doing your part and leaving the outcome to Allah. Bilal's part is to stand; Burhan's part is to stay back.
- *Deepest:* Burhan wanted to go to help, but also to be seen. Bilal's "you pray" is the door to the servant's ending. The crack shows what Burhan can't yet see in himself.

---

**Notes for this script**
- **The azan** (scene 1) is a cinematic, never a prompt. Use a licensed or permissioned recording, or a respectful original recording.
- **Women:** Saad's wife is never seen or voiced, pending the ulama.
- **Sources:**
  - Ibn al-Haytham's optics and dark-room experiments are history. That he feigned madness under al-Hakim is tradition. His lines are written for the game.
  - The Quran verses are 18:82, 24:35, 59:24 and 3:173.
- **To confirm with ulama:** Ibn al-Haytham shown as a featureless figure.


## Chapter 7: I

**Chapter 7: I.** Draft 1. About 35 minutes including the endings. Part of the story bible (Part 2).

- **Veil:** calls itself *The Hero*. Its true name, spoken in Urdu, is **میں** (subtitle: *I*). It is the last veil, a veil of light.
- **Station:** *Rida* (contentment), then *fana* and *baqa*.
- **Guides:** Shams Tabrizi, then Uwais al-Qarani.
- **Last vision:** Madinah at dawn.
- **Pillars:** all four at once.
- **Shape:**
  - The cave (scenes 1–2)
  - Face Day (3)
  - The choice (4)
  - The hero's ending (4a), or the servant's path (5–8)
  - The hidden ending (9)

Format as in chapter 1.

---

### Scene 1: The books in the water (vision)
**Where:** The cave, on Thursday night, with Sain gone. Then a vision: Konya, 1244, a pool in a courtyard where a great scholar sits with his books.
**Who:**
- BURHAN
- MAULANA RUMI, younger here, a famous scholar
- SHAMS TABRIZI, a wandering stranger in black felt, featureless
- RUMI'S STUDENTS

**Play:** Khalwat, then the vision.

Shams walks up to the pool and points at the books.

**SHAMS**
یہ کیا ہیں؟
*What are these?*

**RUMI**
یہ وہ ہے جو تم نہیں سمجھتے۔
*This is something you don't understand.*

Shams sweeps the books into the pool. Rumi jumps to his feet. Shams draws them out one by one, and they are dry.

**RUMI**
یہ کیا ہے؟
*What is this?*

**SHAMS**
یہ وہ ہے جو تم نہیں سمجھتے۔
*This is something you don't understand.*

Shams turns to Burhan. In Burhan's bag are the brass Professor Hadi Trophy and a sheaf of debate notes. Shams takes them and throws them into the pool. They don't come out.

**SHAMS**
تم نے سب کچھ ثابت کیا، سوائے اپنے نہ ہونے کے۔
*You proved everything — except that you are nothing.*

**BURHAN**
میں...؟
*I...?*

**SHAMS**
ہاں۔ یہی تو مسئلہ ہے: "میں"۔
*Yes. That's exactly the problem: "I."*

**Depths**
- *Clear:* Burhan's trophies and proofs are thrown away.
- *Deep:* Knowledge that feeds the self becomes a wall between you and Allah. Shams broke Rumi's scholarly pride, and Rumi became Rumi.
- *Deepest:* The books in the water is a legend, not a record. The trophy that sank carries Sain's name: the teacher's own glory, drowned on purpose.

---

### Scene 2: The last veil
**Where:** The cave's dark, after the vision fades.
**Who:** BURHAN, THE HERO: Burhan's own reflection standing in the dark, its face a screen that reads *HERO*.
**Play:**
- The reflection speaks in Burhan's own voice.
- Burhan can do zikr. The reflection doesn't fade.
- This veil can't be fought. It can only be unveiled, and then refused.

**THE HERO**
یہ تمہارا لمحہ ہے۔ سب کو پتا چلنا چاہیے کہ یہ سب کس نے کیا۔
*This is your moment. Everyone should know who did all this.*

**THE HERO**
بلال کو تم نے بنایا۔ فراز کو تم نے پہچانا۔ اسٹیج تمہارا حق ہے۔
*You made Bilal. You saw through Faraz. The stage is yours by right.*

**Kashf.** The screen cracks. Under the English mask *HERO*, one Urdu word shows through: **میں**. Subtitle: *I*.

**I** *(Burhan's voice, smaller and smaller)*
میں... میں... میں...
*I... I... I...*

**Depths**
- *Clear:* The last enemy is Burhan's wish to be the hero.
- *Deep:* Pride can live inside religion: fame in da'wah, showing off (*riya*), self-admiration (*ujb*). This veil is made of light, because it grew from good deeds.
- *Deepest:* The first "I" in history was Iblis's: "I am better than him" (7:12). Bulleh Shah's question, *main kaun?* ("who am I?"), has only one answer that frees.

---

### Scene 3: The Day of Adornment
**Where:** The Parade Ground, Islamabad. Friday morning, before Jumu'ah.
- A giant stage with screens a storey high.
- A crowd of tens of thousands, half of them already wearing SURAT faces.

**Who:** FARAZ (as the Artist, on stage), BILAL, the CROWD.
**Play:** A cinematic, shown while Burhan is in the cave.

A soft recitation over the crowd shot:

> مَوْعِدُكُمْ يَوْمُ الزِّينَةِ وَأَن يُحْشَرَ النَّاسُ ضُحًى
> *Your appointment is the Day of Adornment, and let the people be gathered at forenoon.* (20:59)

**FARAZ**
آج ہر کسی کو وہ چہرہ ملے گا جس کا وہ حقدار ہے!
*Today, everyone gets the face they deserve!*

The crowd roars.

**FARAZ**
اور اب... ایف نائن پارک کا وہ لڑکا!
*And now... the boy from F-9 Park!*

Bilal climbs the steps in a plain kameez, with his father's tasbih in his hand.

**Depths**
- *Clear:* The whole city has gathered to watch a boy receive a face.
- *Deep:* The Gilding's festival has been timed to come before the believers' gathering on Friday.
- *Deepest:* Pharaoh set his contest with Musa on a festival day, the Day of Adornment, with the people gathered at forenoon (20:59). Faraz has done the same.

---

### Scene 4: The choice
**Where:** The mouth of the cave, Friday morning.
**Who:** BURHAN, and THE HERO's whisper.
**Play:**
- There are no prompts, no UI and no text.
- Down the hill, a path glows gold toward the city and its noise.
- Behind him is the cave, dark and still.
- The player decides by walking: down the path, or back into the cave to kneel.

**THE HERO** *(a whisper)*
جاؤ۔
*Go.*

**Depths**
- *Clear:* Burhan can go and be the hero, or stay and pray.
- *Deep:* The game has trained the player all along to be the hero. The final test is to refuse that instinct.
- *Deepest:* This is the procedural rhetoric of the whole game: the last veil is the player's own wish to win.

---

### Scene 4a: The hero's ending
*(Only if the player walks down the golden path.)*

**Where:** The Parade Ground.
**Play:** A cinematic.
- Burhan pushes through the crowd, and the cameras swing to him.
- The crowd recognises the viral mentor and starts chanting.

**CROWD**
برہان! برہان! برہان!
*Burhan! Burhan! Burhan!*

Faraz turns away from Bilal.

**FARAZ**
اور یہ رہا اصل ہیرو!
*And here's the real hero!*

Faraz lifts a glowing face toward him. It settles over Burhan's mirror, and his face becomes a screen that reads *HERO*. The crowd roars. Bilal stands forgotten at the edge of the stage, and the Gilding re-forms over Islamabad, brighter than before.

Card:
توبہ کا دروازہ کھلا ہے۔
*The door of tawbah is open.*

The game returns the player to the cave mouth, to scene 4.

**Depths**
- *Clear:* By trying to be the hero, Burhan ruins everything.
- *Deep:* His presence stops the miracle. Faraz never falls, because there's a hero on stage to look at instead of the truth.
- *Deepest:* The door of repentance stays open until the sun rises from the west, and the game keeps it open too.

---

### Scene 5: Bilal refuses
*(The servant's path. The player walked back into the cave.)*

**Where:** The cave, intercut with the stage.
**Who:** BURHAN (in sujood), BILAL, FARAZ, the CROWD.
**Play:** A cinematic. Burhan kneels in the cave. Each cut back to him finds him still in sujood.

**BURHAN** *(in sujood, a whisper)*
یا اللہ، اسے سنبھال لے۔ مجھے کچھ نہیں چاہیے۔
*O Allah, hold him steady. I want nothing.*

On stage, Faraz holds out the glowing face.

**FARAZ**
آؤ، بیٹا۔ تمہارا چہرہ تیار ہے۔
*Come, son. Your face is ready.*

**BILAL**
مجھے چہرہ نہیں چاہیے۔ حَسْبُنَا اللّٰهُ وَنِعْمَ الْوَكِيلُ۔
*I don't want a face. Allah is enough for us, and He is the best to rely on.*

The crowd turns on him. Boos rise, the screens howl, and things are thrown. Bilal stands still with the tasbih in his hand.

**Depths**
- *Clear:* A boy stands alone before a whole city and says no.
- *Deep:* This is *tawakkul*: Bilal does his part, and Burhan does his, from the cave.
- *Deepest:* "The people have gathered against you" (3:173). Every boy in this story who stood alone, from Noora in the prologue to Bilal here, stands in the line of the first Bilal, who said "One, One" under the stone.

---

### Scene 6: The Facemaker falls
**Where:** The stage, then all of Islamabad.
**Play:** A cinematic.

Faraz looks into Bilal's smooth face, a face that wants nothing from the crowd. In it he sees his own reflection, the first true image of his life. He lowers the glowing face.

**FARAZ**
یہ چہرہ... میں نہیں بنا سکتا۔
*This face... I cannot make.*

He kneels, then falls into sujood on the stage. The crowd goes silent.

> فَأُلْقِيَ السَّحَرَةُ سُجَّدًا قَالُوا آمَنَّا بِرَبِّ هَارُونَ وَمُوسَىٰ
> *So the magicians were thrown down in prostration. They said, "We believe in the Lord of Harun and Musa."* (20:70)

Then, from the Faisal Mosque across the city, the azan for Jumu'ah. The Gilding cracks across Islamabad:
- Gold falls from the towers like autumn leaves.
- Underneath are clay, stone and green.
- All through the crowd, screen-faces flicker off. Beneath them are smooth faces, blinking at each other. Some people kneel.

**Depths**
- *Clear:* The master of fake faces meets a real one and bows to Allah.
- *Deep:* No argument defeated the Gilding. A boy who wanted nothing did.
- *Deepest:* Pharaoh's magicians knew illusion better than anyone, so they were the first to recognise what wasn't one. The Facemaker's sujood is theirs.

---

### Scene 7: Uwais, then Madinah (the last vision)
**Where:** The cave, still in sujood. Then a vision: the deserts of Yemen, and Madinah at dawn.
**Who:** BURHAN, UWAIS AL-QARANI (a camel herder in rough wool, featureless).
**Play:** Walking.
- Uwais's mother is in a tent nearby. She is never seen.
- At the edge of Madinah, Burhan takes off his shoes and goes no further.
- No figure appears. There is only light.

**UWAIS**
میں نے انہیں کبھی نہیں دیکھا۔ مگر کوئی دن ایسا نہیں گزرا جب میں نے انہیں یاد نہ کیا ہو۔
*I never saw him. But not a day passed that I did not remember him.*

**UWAIS**
میری ماں کو میری ضرورت تھی۔ اسی لیے مدینہ نہ جا سکا۔
*My mother needed me. That's why I could not go to Madinah.*

**BURHAN**
پھر بھی وہ آپ کو جانتے تھے؟
*And still he knew you?*

**UWAIS**
محبت کو آنکھوں کی ضرورت نہیں۔
*Love doesn't need eyes.*

**UWAIS**
چلو۔ ان کا شہر جاگ رہا ہے۔
*Come. His city is waking.*

Madinah at dawn: date palms, doves, footsteps, distant water, and the first light on the city. Burhan stops at the edge, barefoot. An azan comes from far off *(pending ulama; switchable)*.

**BURHAN** *(a whisper, weeping)*
صلی اللہ علیہ وسلم۔
*Peace and blessings be upon him.*

A recitation fills the light:

> يَا أَيُّهَا النَّاسُ قَدْ جَاءَكُم بُرْهَانٌ مِّن رَّبِّكُمْ وَأَنزَلْنَا إِلَيْكُمْ نُورًا مُّبِينًا
> *O mankind, a proof has come to you from your Lord, and We have sent down to you a clear light.* (4:174)

**Depths**
- *Clear:* A man who never met the Prophet ﷺ loved him all his life, just like us.
- *Deep:* Burhan finally learns what his name means. He was never the proof. The proof was sent to mankind, and a person becomes a proof only by following him.
- *Deepest:*
  - Many mufassirin say the *burhan* in 4:174 is the Prophet ﷺ himself.
  - The Prophet ﷺ told Umar of Uwais, "he has a mother to whom he is dutiful," and to ask him to pray for him (Muslim).
  - The whole journey through time has been an *Uwaysi* bond: love across centuries without meeting.

---

### Scene 8: The servant's ending
**Where:** The small mosque near the caves, weeks later. Morning.
**Who:**
- BURHAN
- ABBA
- In the back row: FARAZ, the OLD MAN from the chai stall (chapter 4), AZAD and SAAD
- BILAL
- A YOUNGER BOY

**Play:** A cinematic, with no prompts.

Burhan sweeps the courtyard with Sain's broom. Abba comes up the hill, slowly, out of breath. He sits on the step. He says nothing. Burhan sits beside him. After a while, Abba puts a hand on his son's shoulder.

Inside, people gather in the back row.
- Faraz, in plain clothes.
- The old man from the chai stall.
- Azad, who now wakes others for Fajr.
- Saad.

Then, for the first time in the game, the camera leaves Burhan. It drifts across the courtyard and finds Bilal sitting with a younger boy.

**BILAL** *(to the younger boy)*
سانس اندر جائے تو اللہ۔ سانس باہر آئے تو ہُو۔
*When the breath goes in: Allah. When it comes out: Hu.*

Bilal climbs the steps of the small minaret and gives the azan in a young, cracked voice, the way Sain did.

At the centre of Burhan's chest the fifth light glows, the fifth latifa, **akhfa**. All five shine together. His face is clear, and the crack is gone.

The last words, recited:

> يَا أَيَّتُهَا النَّفْسُ الْمُطْمَئِنَّةُ ۝ ارْجِعِي إِلَىٰ رَبِّكِ رَاضِيَةً مَّرْضِيَّةً ۝ فَادْخُلِي فِي عِبَادِي ۝ وَادْخُلِي جَنَّتِي
> *O soul at peace, return to your Lord, well-pleased and pleasing. Enter among My servants, and enter My Garden.* (89:27–30)

Title: **میں — I. رضا — RIDA.** Then: **بُرہان — BURHAN.** Credits.

**Depths**
- *Clear:* The hero is now a sweeper, and he is at peace.
- *Deep:* All four pillars are on screen at once: service (the broom), purification (the clear face), teaching (Bilal and the boy) and the call (the azan). Everyone Burhan stayed with is in the back row.
- *Deepest:*
  - "Enter among My servants": the hero dissolves into the servants. That is *fana*, and what remains is the servant. That is *baqa*.
  - Sain's words now come from Bilal's mouth, and the chain goes on.

---

### Scene 9: The hidden ending
*(Only for players who gave back every upgrade in chapter 4 and never chased followers.)*

**Play:**
- The credits name every character in the game except one.
- The last line of the credits:

…اور ایک خادم۔
*…and a servant.*

After the credits there is one more scene. It is in another city, at another small mosque, at dawn.
- An old man sweeps the courtyard.
- At the gate, a young man stands watching him, with a brass trophy in his bag.
- Fade out.

**Depths**
- *Clear:* Burhan's name disappears from his own story.
- *Deep:* This is the *malamati*'s reward: no one knows. Sain has gone to find the next one.
- *Deepest:* The chain has no end. Every servant was once someone's "hero" who let go.

---

**Notes for this script**
- **The choice.** It has no UI at all. The player chooses by walking. The hero's ending always returns to the choice, because the door of tawbah stays open.
- **Sacred material:**
  - No Prophet and no Sahabi appears.
  - Madinah is light only.
  - The azan heard there is pending the ulama and must be switchable.
  - Bilal ibn Rabah is referred to only in the Depths, never shown or voiced.
- **Women:** Uwais's mother is never seen. Her presence is a tent and a line.
- **Sources:**
  - Shams throwing Rumi's books into the water is legend.
  - The hadith of Uwais is in Sahih Muslim.
  - The verses used are 7:12, 20:59, 20:70, 3:173, 4:174 and 89:27–30. Recitation must come from licensed or permissioned recordings.
- **To confirm with ulama:**
  - Shams, Rumi and Uwais al-Qarani shown as featureless figures.
  - The Madinah vision and its azan.


---

# Part 4: Beat sheet

*A one-page overview of chapters 2–7. The full scripts in Part 3 win where they differ.*

**Beat sheet for chapters 2–7.** Draft 1. Part of the story bible (Part 2).

This file is the one-page overview of chapters 2–7: each chapter scene by scene, with its key lines. Every chapter now has a full script (listed at the end), and where a script differs from this sheet, the script wins. Times follow the bible's pacing budget. Lines marked *(written for the game)* are not quotations.

## The veils' names
Masks speak English. True names are spoken in plain Urdu, with English subtitles.

| Mask (English) | True name (spoken) | Subtitle |
|---|---|---|
| The Good Life | ملمع | The Gilding |
| Neutral | بھول | The Forgetting |
| Freedom | گراوٹ | Freefall |
| Plenty | بھوک | The Hunger |
| Progress | اترائی | The Slow Descent |
| Comfort | جھاگ | Foam |
| The Artist | چہرہ ساز | The Facemaker |
| The Hero | میں | I |

## Which pillar each chapter builds
| Chapter | Pillar it builds |
|---|---|
| 1 | Dawat o Tazkeer begins at home: reminding starts with remembering |
| 2 | Islah: restraint |
| 3 | Khidmat e Khalq: service |
| 4 | Taleem o Taalum: learning |
| 5 | Tazkiah through *mujahada*, and teaching Bilal |
| 6 | Dawat o Tazkeer: the call before a city |
| 7 | All four at once |

---

## Chapter 2: Freefall (about 35 min)
**Veil:** Freedom / گراوٹ (Freefall). **Station:** *Wara'* (restraint). **Guide:** Maulana Rumi. **Vision:** Konya, 1250s.

1. **Azad's flat.** It's a rooftop flat in Blue Area, with a party going. The party is heard as crowd noise, laughter and phone chimes, never as music. Azad is using "ice" from the same dealers as chapter 1.
2. **Arguments fail.** Burhan tries proof, debate and speech, and every line bounces off.
   - **AZAD:** تمہارے پاس ہر بات کی دلیل ہے، بھائی۔ میرے پاس صرف ایک زندگی ہے۔
     *You've got an argument for everything, bro. I've only got one life.*
3. **Fight.** The dealers come to the flat. This time Burhan wins, but he fights in anger and his mirror still dims. The game teaches the anger rule through a victory.
4. **The Gilding.** Azad's tower has no floors. Freedom is a voice in the wind.
   - **FREEDOM:** کوئی تمہیں نہیں بتا سکتا کہ کیا کرنا ہے۔
     *No one can tell you what to do.*
   - Burhan and Azad fall. The freer they get, the faster they fall.
5. **Vision: Konya.**
   - Rumi tells the Masnavi parable of the snake-catcher and the frozen dragon, and the player lives it as a story inside the story. A dragon is carried into Baghdad, the sun thaws it, and it devours the crowd that came to stare.
   - **RUMI** *(Masnavi, in Persian):* نفست اژدرهاست، او کی مرده است / از غم بی‌آلتی افسرده است
     *Your nafs is a dragon — how is it dead? It is only frozen, for want of means.*
   - **RUMI** *(written for the game):* آزادی یہ نہیں کہ کوئی حد نہ ہو۔ آزادی یہ ہے کہ اللہ کے سوا کسی کی غلامی نہ ہو۔
     *Freedom isn't having no limits. Freedom is being no one's slave but Allah's.*
6. **Back in the Gilding.** *Wara'* becomes a traversal mechanic. Burhan places floors under himself, which are Allah's limits. They stop the fall. He cannot place them under Azad. Kashf: **گراوٹ**.
7. **The hospital (PIMS).** Azad has overdosed. Burhan stays all night.
   - **Sohbat unlocks.** It isn't a line of dialogue but an action: *Stay*.
   - Near dawn, Azad squeezes his hand.
   - **AZAD:** تم گئے کیوں نہیں؟
     *Why didn't you leave?*
   - Burhan doesn't answer. The sohbat mark lights.

Station: **WARA'**.

---

## Chapter 3: The Hunger (about 35 min)
**Veil:** Plenty / بھوک (The Hunger). **Station:** *Zuhd* (renunciation). **Guides:** Baba Farid, Nizamuddin Auliya. **Vision:** Pakpattan, then Delhi.

1. **11.11.** "The Pinnacle" mall in Blue Area holds its biggest sale of the year, with a countdown clock and the crowds massing.
2. **Chaudhry Sahib.** He is Abba's property-dealer friend, and he is selling plots in a new housing society. The launch offer is "walk your plot": as much land as you can walk around between Fajr and Maghrib, for one price. This is Tolstoy's *How Much Land Does a Man Need?*, reframed. Abba wants to put Burhan's scholarship savings into it.
3. **Launch day.** Burhan follows Chaudhry as he marks more and more land and cannot stop.
   - **CHAUDHRY:** بس ایک کنال اور... بس ایک اور...
     *Just one more kanal... just one more...*
   - He collapses at Maghrib, at the last stake, and dies. He is buried in six feet of earth.
4. **The ward.** In Azad's hospital ward, an old man is dying. His son is reciting the kalima.
   - **OLD MAN:** میرا فون... میرا فون دو...
     *My phone... give me my phone...*
5. **Fight.** On the night of the sale, robbers hit a poor man's shop near the mall. Burhan protects him. This is *khidmat*.
6. **The Gilding: the mall-temple.**
   - The Hunger is a swarm of glittering wants. Each one Burhan touches multiplies.
   - **PLENTY:** تمہیں اور چاہیے۔ تم اس کے حقدار ہو۔
     *You need more. You deserve it.*
   - **Durood is introduced here.** Each blessing returns tenfold as light: the true multiplication against the false one. The countdown chime is never a parody of the azan.
7. **Vision: Pakpattan.**
   - Baba Farid's langar: the player serves food to a long queue, and everyone eats free.
   - **BABA FARID** *(Punjabi):* رُکھی سُکھی کھا کے ٹھنڈا پانی پی / فریدا ویکھ پرائی چوپڑی نہ ترسائیں جی
     *Eat your dry bread and drink cold water; Farid, seeing another's buttered bread, don't let your heart crave.*
   - **Then Delhi.** A Sultan's gold arrives at Nizamuddin Auliya's khanqah, which has two doors. If the Sultan comes in through one, the saint leaves by the other (tradition).
8. **Return.** At Chaudhry's grave, Burhan returns the money to Abba and refuses the scheme. Kashf: **بھوک**.
   - **BURHAN:** ابنِ آدم کا پیٹ مٹی کے سوا کوئی چیز نہیں بھرتی۔
     *Nothing fills the son of Adam but dust.* (Bukhari)

Station: **ZUHD**. Second latifa: **ruh**.

---

## Chapter 4: The Slow Descent (about 50 min, the midpoint)
**Veil:** Progress / اترائی (The Slow Descent). **Station:** *Faqr* (need of Allah). **Guides:** Imam Ghazali, Ibn Rushd. **Visions:** Baghdad in 1095, then Cordoba in the 1190s.

1. **The journey.** Sain takes Burhan walking through the hills for three days, on one condition, the condition of the hidden teacher in Al-Kahf:
   - **SAIN:** جب تک میں نہ بتاؤں، کیوں مت پوچھنا۔
     *Don't ask why until I tell you.*
2. **Strange act 1.** Sain smashes Burhan's phone on a rock.
   - **SAIN:** ابھی نہیں۔
     *Not yet.*
3. **Strange act 2.** At a chai stall, Burhan is about to win an argument with an old man who mocks prayer. Sain stops him mid-sentence and pays for the old man's tea.
4. **Strange act 3.** In Saidpur the villagers refuse them food and water. Sain spends the day rebuilding a broken wall for free, and the player carries the stones.
5. **The championship.** This is the biggest debate of Burhan's life, broadcast on Faraz's network. Mid-argument, his voice locks.
   - Every option on the wheel produces only silence.
   - The crowd murmurs, and Faraz watches.
   - It echoes Ghazali, whose tongue was locked before his students.
6. **The Gilding: escalators that rise forever.**
   - **PROGRESS:** اپ گریڈ کرو۔ تمہیں بہتر ہونے کا حق ہے۔
     *Upgrade. You deserve to be better.*
   - **Twist:**
     - The player's upgrade tree (speed, influence, followers) is shown to be the escalator. The true elevation appears on screen, far below where Burhan started.
     - He gives the upgrades back one by one. That is *faqr*, becoming poor before Allah, and each one he returns lifts him.
7. **Vision: Baghdad, 1095.** Ghazali, the most famous scholar of his age, falls silent at the Nizamiyya, then leaves fame and wealth behind.
   - **GHAZALI** *(written for the game):* علم نے مجھے دروازے تک پہنچایا۔ اندر جانے کے لیے مجھے سب کچھ چھوڑنا پڑا۔
     *Knowledge brought me to the door. To go in, I had to leave everything.*
8. **Vision: Cordoba, 1190s.** Ibn Rushd, judge and philosopher, sits with his book on the harmony of reason and revelation.
   - **IBN RUSHD** *(his principle in "Fasl al-Maqal"):* حق، حق کا مخالف نہیں ہوتا؛ بلکہ اس کی موافقت کرتا اور اس کی گواہی دیتا ہے۔
     *Truth does not oppose truth; it agrees with it and bears witness to it.*
   - **Then a jump to a lecture hall in Paris, 1270s.** The Latin "Averroists" are accused of teaching two truths, one for reason and one for faith.
   - **The stolen name.** A scribe writes *Averroes*. Then a manuscript signed *Algoritmi* (al-Khwarizmi), and the word "algorithm" glows over the Gilding's code. Burhan's name, and his civilization's, were taken and cut off from revelation.
9. **The acts explained,** in the pattern of Al-Kahf.
   - **SAIN:** اب پوچھو۔
     *Now ask.*
   - The phone was how SURAT tracked him.
   - The old man at the chai stall was about to return to prayer, and losing an argument in public would have driven him away.
   - The wall hides what Bilal's father left his son (chapter 6).
10. **Fight.** Developers' men come to bulldoze Saidpur's old houses for a "heritage resort," which is progress at work. The villagers who refused them food now fight beside Burhan.
11. **Recognition.** An old villager calls Sain "Professor sahib."
    - **BURHAN:** آپ... پروفیسر ہادی ہیں؟
      *You... are Professor Hadi?*
    - **SAIN:** تھا۔
      *I was.*

Kashf: **اترائی**. Station: **FAQR**. Third latifa: **sirr**.

---

## Chapter 5: Foam (about 45 min)
**Veil:** Comfort / جھاگ (Foam). **Station:** *Sabr* (endurance). **Guides:** Ibn Khaldun, Salahuddin Ayyubi. **Visions:** Granada in the 1360s, then Hattin and Jerusalem in 1187. **Optional side vision:** Alp Arslan at Malazgirt.

1. **Soft days.** Burhan has a new phone, the AC on, food delivered, endless scrolling.
   - **COMFORT:** آرام کرو۔ تم نے بہت کچھ کیا ہے۔
     *Rest. You've done so much.*
2. **The Gilding: Foam.** Millions drift like foam on a flood through Islamabad's streets. No one can stand, and Burhan is swept along.
3. **Vision: Granada, 1360s.** Ibn Khaldun, there as an envoy, walks Burhan through a court of gardens, silk and poets.
   - **IBN KHALDUN** *(written for the game, from his theory of dynasties):* عیش قوموں کی رگوں میں نیند بھر دیتا ہے۔ تیسری نسل تک تلوار زنگ کھا جاتی ہے۔
     *Luxury pours sleep into a people's veins. By the third generation the sword has rusted.*
   - A flash forward to 1492: the keys of Granada are handed over.
4. **Vision: Hattin, 1187.**
   - A battle fought under the rules of war.
   - Then Jerusalem's surrender, and Salahuddin's mercy to its people, set against the massacre of 1099.
   - **SALAHUDDIN** *(tradition):* میں کیسے مسکراؤں جب اقصیٰ قید میں ہے؟
     *How can I smile while Al-Aqsa is in captivity?*
5. **The chilla.** Burhan spends forty days with Sain in the mountains above the Margallas, toward the Galiyat. He climbs through cold, fasting and monsoon rain, and keeps to the breath. A time-lapse shows his body change.
6. **The akhara.** An old *pehlwan* teaches Burhan *kushti*. He learns to fight in control, and the anger rule is mastered.
7. **Training Bilal.** In F-9 Park, Burhan teaches Bilal the four pillars: heart, mind, tongue and hands. Azad, recovering, helps.
   - **BILAL:** تم بدل گئے ہو، ہیرو۔
     *You've changed, hero.*
   - **BURHAN:** ابھی بدل رہا ہوں۔
     *Still changing.*
8. **Fight.** The gang comes for Bilal in the park. Burhan wins, in control.
9. **The Gilding again.** This time Burhan stands, and the foam breaks around him. Kashf: **جھاگ**.
   - Bilal's admiration quietly feeds the last veil. The player isn't told.

Station: **SABR**. Fourth latifa: **khafi**.

---

## Chapter 6: The Facemaker (about 35 min)
**Veil:** The Artist / چہرہ ساز (The Facemaker). **Station:** *Tawakkul* (trust). **Guide:** Ibn al-Haytham. **Vision:** Cairo, about 1011–1021.

1. **Sain vanishes.** The courtyard is swept and the broom leans on the wall, but Sain is gone. Burhan searches the cave and Saidpur.
2. **The wall.** In Saidpur, inside the wall Sain rebuilt, is a tin box holding Bilal's father's zikr diary and letters to his son.
   - **THE LETTER:** جب بڑے ہو جاؤ تو سائیں کو ڈھونڈنا۔
     *When you are grown, find Sain.*
3. **Face Day is announced.** Faraz's SURAT will give everyone a new face at the Parade Ground. Videos of "the faceless boy of F-9 Park" teaching kids have gone viral. Bilal never showed his face in them. Faraz invites him to receive one on stage before the whole city.
4. **The filtered marriage.** The young couple in the family break up when their filters fail. How women appear is still to be confirmed with ulama.
5. **The city turns on the faceless.**
   - Feeds and mobs ask: *Why does he hide his face?*
   - **Fight:** a mob comes for the F-9 circle, and Burhan protects the kids.
6. **The Gilding: the Hall of Faces.**
   - **THE ARTIST:** تم جیسا چاہو، ویسا دکھ سکتے ہو۔
     *You can look however you want.*
   - **Fight:** whispers with screen faces attack, and Burhan's mirror-face throws their light back at them.
7. **Vision: Cairo.** Ibn al-Haytham has feigned madness to escape the caliph's demand (tradition). In his dark room, the image on the wall forms upside down.
   - **IBN AL-HAYTHAM** *(written for the game):* اندھیرے کمرے میں تصویر ہمیشہ الٹی بنتی ہے۔ جو دنیا تمہیں اسکرین پر دکھائی جاتی ہے، وہ بھی۔
     *In a dark room the image always forms upside down. So does the world they show you on a screen.*
8. **Faraz's office, at night.** He isn't a monster; he believes in what he does.
   - **FARAZ:** میں لوگوں کو وہ دیتا ہوں جو وہ چاہتے ہیں۔ تم کیا دیتے ہو؟
     *I give people what they want. What do you give?*
   - **BURHAN:** جو انہیں چاہیے۔
     *What they need.*
   - Kashf: **چہرہ ساز**.
9. **Tawakkul.** The night before Face Day, the city has gathered against the faceless (3:173). Bilal decides to go on stage, not to take a face but to refuse one. Burhan wants to go with him.
   - **BILAL:** تم نے کہا تھا، دل اللہ کے ساتھ رکھو، باقی وہ خود سنبھال لے گا۔
     *You said: keep your heart with Allah, and He'll handle the rest.*

Station: **TAWAKKUL**.

---

## Chapter 7: I (about 35 min, with the endings)
**Veil:** The Hero / میں (I). **Station:** *Rida*, then *fana* and *baqa*. **Guides:** Shams Tabrizi, then Uwais al-Qarani. **Last vision:** Madinah at dawn.

1. **The cave, the night before.**
   - **Vision: Konya, 1244.** Shams meets Rumi and throws his books into the pool (legend). Then he turns to Burhan and throws his trophies and debate notes into the water.
   - **SHAMS** *(written for the game):* تم نے سب کچھ ثابت کیا، سوائے اپنے نہ ہونے کے۔
     *You proved everything — except that you are nothing.*
2. **The last veil.** In the dark appears Burhan's own reflection, with a screen face that reads HERO. It speaks in his own voice.
   - **THE HERO:** یہ تمہارا لمحہ ہے۔ سب کو پتا چلنا چاہیے کہ یہ سب کس نے کیا۔
     *This is your moment. Everyone should know who did all this.*
   - Kashf: **میں**.
3. **Face Day, the Day of Adornment (20:59).** The city has gathered at the Parade Ground, with Faraz on stage. Bilal walks up, and Faraz offers him a face.
   - **BILAL:** مجھے چہرہ نہیں چاہیے۔ حسبنا اللہ ونعم الوکیل۔
     *I don't want a face. Allah is enough for us, and He is the best to rely on.*
   - The crowd turns on him, and the screens howl.
4. **Faraz's sujood.** He looks into Bilal's smooth face, a face that wants nothing from the crowd. In it he sees his own reflection, the first true image of his life.
   - **FARAZ:** یہ چہرہ... میں نہیں بنا سکتا۔
     *This face... I cannot make.*
   - He falls into sujood on the stage, like the magicians (20:70). The Gilding over Islamabad cracks.
5. **The choice.** Burhan stands at the cave mouth. The city's noise carries up to him, and a glowing path runs down toward the Parade Ground. Behind him the cave is dark and still.
   - **Run to the stage:** the hero's ending. The crowd chants his name, and the Gilding gives him a face: a screen that reads *HERO*. A card follows: *The door of tawbah is open.* The player returns to the choice.
   - **Stay in sujood:** the servant's path.
6. **The last vision** (servant's path). In sujood, the chain carries Burhan to Uwais al-Qarani in Yemen, a camel herder.
   - **UWAIS** *(written for the game):* میں نے انہیں کبھی نہیں دیکھا۔ مگر کوئی دن ایسا نہیں گزرا جب میں نے انہیں یاد نہ کیا ہو۔
     *I never saw him. But not a day passed that I did not remember him.*
   - Then Madinah at dawn. There is no figure, only light, the city waking, and an azan from far off. This is to be confirmed with ulama.
7. **The servant's ending.**
   - **The courtyard.** Weeks later, Burhan sweeps the small mosque's courtyard with Sain's broom.
   - **Abba.** He comes up the hill, sits beside his son, and says nothing. That is sohbat.
   - **The camera lets go.** For the first time it leaves Burhan. It finds Bilal teaching a younger boy, then climbing the minaret steps to give the azan.
   - **The last words,** recited (89:27–30):
     يَا أَيَّتُهَا النَّفْسُ الْمُطْمَئِنَّةُ ارْجِعِي إِلَىٰ رَبِّكِ رَاضِيَةً مَّرْضِيَّةً فَادْخُلِي فِي عِبَادِي وَادْخُلِي جَنَّتِي
     *O soul at peace, return to your Lord, well-pleased and pleasing. Enter among My servants, and enter My Garden.*
8. **The hidden ending.** It is for players who gave back every upgrade and never chased followers. The credits name every character but one, then end with *…and a servant.*

Station: **RIDA**. Fifth latifa: **akhfa**.

---

**Full scripts:** Part 3.

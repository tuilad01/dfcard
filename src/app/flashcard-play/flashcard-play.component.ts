import { Component, OnInit } from '@angular/core';
import { Group, GroupService, Phrase } from '../group/group.service';
import { NgFor, NgIf } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { group, state } from '@angular/animations';
import { ButtonModule } from 'primeng/button';
import { findIndex } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { DropdownChangeEvent, DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';

const KEY = '/myapp/flashcards/play';
const VOICE_SETTING_KEY = '/myapp/flashcards/settings/voice';

export type Flashcard = {
  [key: string]: any;
  id: string;
  name: string;
  description: string;
  state1: Phrase[];
  state2: Phrase[];
  state3: Phrase[];
  currentState: number;
  updatedAt?: Date;
  count?: number;
};

const defaultFlashcard: Flashcard = {
  id: '',
  name: '',
  description: '',
  state1: [],
  state2: [],
  state3: [],
  currentState: 0,
};

function getFlashcard(id: string): Flashcard | undefined {
  const strFlashcards = localStorage.getItem(KEY);
  if (!strFlashcards) {
    return defaultFlashcard;
  }

  const flashcards = JSON.parse(strFlashcards) as Flashcard[];

  return flashcards.find((flashcard) => flashcard.id === id);
}

function setFlashcard(item: Flashcard): void {
  const strFlashcards = localStorage.getItem(KEY);
  const flashcards = strFlashcards
    ? (JSON.parse(strFlashcards) as Flashcard[])
    : [];
  const index = flashcards.findIndex((fc) => fc.id === item.id);
  if (index >= 0) {
    flashcards[index] = item;
  } else {
    flashcards.push(item);
  }
  localStorage.setItem(KEY, JSON.stringify(flashcards));
}

function shuffle(array: Phrase[]) {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
}

function getPhrases(flashcard: Flashcard): Phrase[] {
  switch (flashcard.currentState) {
    case 0:
      return [...flashcard.state1];
    case 1:
      return [...flashcard.state1, ...flashcard.state2];
    case 2:
      return [...flashcard.state1, ...flashcard.state2, ...flashcard.state3];
    default:
      return [];
  }
}

function calcNextState(flashcard: Flashcard, pass: Phrase[], fail: Phrase[]) {
  const state1 = [];
  const state2 = [];
  const state3 = [];

  const mapping = (state: number) => {
    return (phrase: any): any => {
      phrase.state = state;
      return phrase;
    };
  };

  const phrases = [
    ...flashcard.state1.map(mapping(0)),
    ...flashcard.state2.map(mapping(1)),
    ...flashcard.state3.map(mapping(2)),
  ];

  for (const phrase of phrases) {
    // for next state
    if (pass.some((p) => p.id === phrase.id)) {
      phrase.state++;

      // maxium state = 2
      if (phrase.state > 2) {
        phrase.state = 2;
      }
    } else if (fail.some((f) => f.id === phrase.id)) {
      phrase.state = 0;
    }

    // classify states
    if (phrase.state < 1) {
      delete phrase.state;
      state1.push(phrase);
    } else if (phrase.state === 1) {
      delete phrase.state;
      state2.push(phrase);
    } else {
      delete phrase.state;
      state3.push(phrase);
    }
  }

  return [state1, state2, state3];
}

@Component({
  selector: 'app-flashcard-play',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    ButtonModule,
    DialogModule,
    DropdownModule,
    FormsModule,
  ],
  templateUrl: './flashcard-play.component.html',
  styleUrl: './flashcard-play.component.css',
})
export class FlashcardPlayComponent implements OnInit {
  speakingText = '';
  phrases: Phrase[] = [];
  flashcard: Flashcard = defaultFlashcard;
  flippedFlashcards: string[] = [];
  hiddenFlashcards: string[] = [];
  voices: SpeechSynthesisVoice[] = [];
  dropdownVoices: { label: string; value: string }[] = [];
  selectedVoice? = '';
  isVisibleDialog = false;
  objState: { [key: number]: string } = {
    0: 'state1',
    1: 'state2',
    2: 'state3',
  };
  get state() {
    return (this.flashcard.currentState + 1) % 4;
  }

  constructor(
    private groupService: GroupService,
    private route: ActivatedRoute,
  ) {}
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      alert('Bad request!');
      return;
    }

    this.flashcard = getFlashcard(id) || defaultFlashcard;

    this.groupService.getGroup(id).subscribe((data: Group) => {
      if (!data) {
        alert('Not found any group!');
        return;
      }
      // if flashcard exist, we will update phrases in flascard
      // otherwise, we map group to flashcard
      if (this.flashcard.id) {
        const state1 = [];
        const state2 = [];
        const state3 = [];

        for (let index = 0; index < data.phrases.length; index++) {
          const phrase = data.phrases[index];

          if (this.flashcard.state2.some((ph) => ph.id === phrase.id)) {
            state2.push(phrase);
            continue;
          }

          if (this.flashcard.state3.some((ph) => ph.id === phrase.id)) {
            state3.push(phrase);
            continue;
          }

          state1.push(phrase);
        }

        this.flashcard.state1 = state1;
        this.flashcard.state2 = state2;
        this.flashcard.state3 = state3;
      } else {
        this.flashcard.id = data.id;
        this.flashcard.name = data.name;
        this.flashcard.description = data.description;
        this.flashcard.state1 = data.phrases;
      }

      // create a flashcard object to track states and count play number of this group
      setFlashcard(this.flashcard);

      // this step will prepare phrases to play
      this.phrases = getPhrases(this.flashcard);
      shuffle(this.phrases);
    });

    this.getVoices().then((voices) => {
      this.voices = voices;
      //console.log(this.voices);
      this.dropdownVoices = voices.map((voice) => ({
        label: `${voice.lang} - ${voice.name}`,
        value: voice.voiceURI,
      }));
      const voiceName =
        localStorage.getItem(VOICE_SETTING_KEY) || 'Google US English';
      this.selectedVoice = voiceName;
    });
  }

  flip(id: string) {
    const index = this.flippedFlashcards.indexOf(id);
    if (index >= 0) {
      this.flippedFlashcards.splice(index, 1);
    } else {
      this.flippedFlashcards.push(id);
    }
  }

  next() {
    const [pass, fail] = this.classify(this.phrases, ({ id }) =>
      this.hiddenFlashcards.includes(id),
    );

    const [state1, state2, state3] = calcNextState(this.flashcard, pass, fail);

    this.flashcard.state1 = state1;
    this.flashcard.state2 = state2;
    this.flashcard.state3 = state3;

    this.flashcard.currentState = (this.flashcard.currentState + 1) % 3;
    this.flashcard.updatedAt = new Date();

    if (!this.flashcard.count) {
      if (this.flashcard.currentState === 0) {
        this.flashcard.count = 1;
      }
    } else {
      this.flashcard.count += 1;
    }

    this.hiddenFlashcards = [];
    this.flippedFlashcards = [];

    setFlashcard(this.flashcard);

    this.phrases = getPhrases(this.flashcard);
    shuffle(this.phrases);
  }

  hide(id: string) {
    this.hiddenFlashcards.push(id);
  }

  async speak(event: MouseEvent, text: string) {
    event.preventDefault();
    event.stopPropagation();

    this.speakingText = text;
    const pitch = 1;
    const rate = 1;
    const voiceUri = this.selectedVoice;

    const voice = this.voices.find((voice) => voice.voiceURI === voiceUri);

    const speechSynthesisUtterance = new SpeechSynthesisUtterance(text);
    speechSynthesisUtterance.pitch = pitch;
    speechSynthesisUtterance.rate = rate;
    speechSynthesisUtterance.voice = voice!;
    speechSynthesis.cancel();
    speechSynthesis.speak(speechSynthesisUtterance);

    this.speakingText = '';
  }

  showVoiceSelectionDialog() {
    this.isVisibleDialog = true;
  }

  selectVoice(event: DropdownChangeEvent) {
    this.selectedVoice = event.value;
    localStorage.setItem(VOICE_SETTING_KEY, event.value);
  }

  private async getVoices(): Promise<SpeechSynthesisVoice[]> {
    let id: any;
    return await new Promise((resolve) => {
      id = setInterval(() => {
        if (window.speechSynthesis.getVoices().length > 0) {
          clearInterval(id);
          id = null;
          resolve(window.speechSynthesis.getVoices());
        }
      }, 100);
    });
  }

  // private classifyByPhraseId(list: any[]) {
  //   return this.classify(list, )
  // }
  private classify(list: any[], condition: (listItem: any) => boolean) {
    const pass: any[] = [];
    const fail: any[] = [];

    for (const item of list) {
      (condition(item) ? pass : fail).push(item);
    }

    return [pass, fail];
  }
}

import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Group, GroupService, Phrase } from '../group/group.service';
import { CommonModule, NgFor } from '@angular/common';
import { Router } from '@angular/router';
import { Flashcard } from '../flashcard-play/flashcard-play.component';
import { BadgeModule } from 'primeng/badge';

const KEY = '/myapp/flashcards/favorite';
const FLASHCARDS_KEY = '/myapp/flashcards/play';

interface GroupEx extends Group {
  updatedAt?: Date;
  count?: number;
  forgetting?: number;
}

function getBookmarks(): string[] {
  const strFlashcards = localStorage.getItem(KEY);
  return strFlashcards ? (JSON.parse(strFlashcards) as string[]) : [];
}

function setBookmarks(list: string[]): void {
  localStorage.setItem(KEY, JSON.stringify(list));
}

function getFlashcards(): Flashcard[] {
  const strFlashcards = localStorage.getItem(FLASHCARDS_KEY);
  if (!strFlashcards) {
    return [];
  }

  return JSON.parse(strFlashcards) as Flashcard[];
}

@Component({
  selector: 'app-flashcard',
  standalone: true,
  imports: [ButtonModule, NgFor, BadgeModule, CommonModule],
  templateUrl: './flashcard.component.html',
  styleUrl: './flashcard.component.css',
})
export class FlashcardComponent implements OnInit {

  groups: GroupEx[] = [];
  bookmarks: string[] = [];
  flashcards: Flashcard[] = [];


  constructor(
    private groupService: GroupService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.bookmarks = getBookmarks();
    this.groupService.getGroups().subscribe((groups) => {
      groups.sort((current) =>
        this.bookmarks.indexOf(current.id) >= 0 ? -1 : 1,
      );
      this.groups = groups;

      // get updateAt field
      this.flashcards = getFlashcards();

      this.flashcards.map((flashcard) => {
        const group = this.groups.find((gr) => gr.id === flashcard.id);
        if (!group) {
          return false;
        }
        group.updatedAt = flashcard.updatedAt
          ? new Date(flashcard.updatedAt)
          : undefined;
        group.count = flashcard.count;

        // counting number of phrases that users do not yet remmembered.
        group.forgetting = group.phrases.length - flashcard.state3?.length;

        return true;
      });
    });
  }

  bookmark(id: string) {
    const bookmarks = this.bookmarks.filter((bookmarkId) =>
      this.groups.some((gr) => gr.id === bookmarkId),
    );
    const index = bookmarks.indexOf(id);
    if (index >= 0) {
      bookmarks.splice(index, 1);
    } else {
      bookmarks.push(id);
    }

    this.bookmarks = bookmarks;
    setBookmarks(bookmarks);
  }

  play(id: string) {
    this.router.navigate([`/flashcard-play/${id}`]);
  }

  calculateTime(time?: Date) {
    let result = '';
    if (!time) {
      return result;
    }

    const start = new Date();
    const end = new Date(time);
    // if (typeof end === 'string') {
    //   end = new Date(end);
    // }
    // if (start && typeof start === 'string') {
    //   start = new Date(start);
    // }

    const daysOfWeek = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];

    const diff = start.getTime() - end.getTime();
    const timeDivisions = [
      {
        name: 'seconds',
        threshold: 60,
        converter: (seconds: number) => seconds / 1000,
      },
      {
        name: 'minutes',
        threshold: 60,
        converter: (seconds: number) => seconds / 1000 / 60,
      },
      {
        name: 'hours',
        threshold: 24,
        converter: (seconds: number) => seconds / 1000 / 60 / 60,
      },
      {
        name: 'days',
        threshold: 7,
        converter: (seconds: number) => seconds / 1000 / 60 / 60 / 24,
      },
    ];
    for (const timeDivision of timeDivisions) {
      const value = Math.round(timeDivision.converter(diff));
      if (value < timeDivision.threshold) {
        if (timeDivision.name === 'days') {
          result = daysOfWeek[end.getDay()];
        } else {
          result = `${value} ${timeDivision.name}`;
        }
        break;
      }
    }

    if (!result) {
      result = end.toLocaleString();
    }

    return result;
  }
}

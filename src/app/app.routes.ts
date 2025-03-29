import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./home/home.component').then(
        (component) => component.HomeComponent
      ),
  },
  {
    path: 'group',
    loadComponent: () =>
      import('./group/group.component').then(
        (component) => component.GroupComponent
      ),
  },
  {
    path: 'flashcard',
    loadComponent: () =>
      import('./flashcard/flashcard.component').then(
        (component) => component.FlashcardComponent
      ),
  },
  {
    path: 'flashcard-play/:id',
    loadComponent: () =>
      import('./flashcard-play/flashcard-play.component').then(
        (component) => component.FlashcardPlayComponent
      ),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./page-not-found/page-not-found.component').then(
        (component) => component.PageNotFoundComponent
      ),
  },
];

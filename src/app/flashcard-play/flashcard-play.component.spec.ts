import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlashcardPlayComponent } from './flashcard-play.component';

describe('FlashcardPlayComponent', () => {
  let component: FlashcardPlayComponent;
  let fixture: ComponentFixture<FlashcardPlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlashcardPlayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlashcardPlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

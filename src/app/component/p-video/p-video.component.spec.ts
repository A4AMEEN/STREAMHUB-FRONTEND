import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PVideoComponent } from './Play-video.component';

describe('PVideoComponent', () => {
  let component: PVideoComponent;
  let fixture: ComponentFixture<PVideoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PVideoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PVideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

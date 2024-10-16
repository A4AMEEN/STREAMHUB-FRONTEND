import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StreamCreatorComponent } from './stream-creator.component';

describe('StreamCreatorComponent', () => {
  let component: StreamCreatorComponent;
  let fixture: ComponentFixture<StreamCreatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StreamCreatorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StreamCreatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveStreamViewerComponent } from './live-stream-viewer.component';

describe('LiveStreamViewerComponent', () => {
  let component: LiveStreamViewerComponent;
  let fixture: ComponentFixture<LiveStreamViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LiveStreamViewerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LiveStreamViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChannelVideoComponent } from './channel-video.component';

describe('ChannelVideoComponent', () => {
  let component: ChannelVideoComponent;
  let fixture: ComponentFixture<ChannelVideoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChannelVideoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChannelVideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

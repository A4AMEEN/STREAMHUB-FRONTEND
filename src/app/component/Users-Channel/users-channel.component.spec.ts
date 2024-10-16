import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersChannelComponent } from './users-channel.component';

describe('UsersChannelComponent', () => {
  let component: UsersChannelComponent;
  let fixture: ComponentFixture<UsersChannelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UsersChannelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsersChannelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

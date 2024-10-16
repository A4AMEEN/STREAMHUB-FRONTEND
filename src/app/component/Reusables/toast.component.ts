import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-toast',
  template: `
    <div [@toastTrigger]="state" class="toast" [ngClass]="type">
      {{ message }}
    </div>
  `,
  styles: [`
    .toast {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px;
      border-radius: 4px;
      color: white;
      font-weight: bold;
      z-index: 9999;
      box-shadow: 0 0 10px rgba(0,0,0,0.2);
    }
    .success { background-color: #4CAF50; }
    .error { background-color: #F44336; }
  `],

animations: [
    trigger('toastTrigger', [
      state('show', style({
        opacity: 1,
        transform: 'translateY(0)'
      })),
      state('hide', style({
        opacity: 0,
        transform: 'translateY(-100%)'
      })),
      transition('hide => show', animate('300ms ease-in')),
      transition('show => hide', animate('300ms ease-out'))
    ])
  ]
  // ... animations stay the same
})
export class ToastComponent implements OnInit, OnDestroy {
  @Input() message: string = '';
  @Input() type: 'success' | 'error' = 'success';
  state: 'show' | 'hide' = 'hide';

  ngOnInit() {
    console.log('ToastComponent: ngOnInit called');
    this.show();
  }

  ngOnDestroy() {
    console.log('ToastComponent: ngOnDestroy called');
  }

  show() {
    console.log('ToastComponent: show called');
    this.state = 'show';
  }

  hide() {
    console.log('ToastComponent: hide called');
    this.state = 'hide';
  }
}
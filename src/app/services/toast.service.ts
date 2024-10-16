import { Injectable, ComponentRef, ComponentFactoryResolver, ApplicationRef, Injector, EmbeddedViewRef } from '@angular/core';
import { ToastComponent } from '../component/Reusables/toast.component';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastComponentRef: ComponentRef<ToastComponent> | null = null;

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector
  ) {}

  showSuccess(message: string) {
    console.log('ToastService: showSuccess called with message:', message);
    this.show(message, 'success');
  }

  showError(message: string) {
    console.log('ToastService: showError called with message:', message);
    this.show(message, 'error');
  }

  private show(message: string, type: 'success' | 'error') {
    this.hideToast();
  
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(ToastComponent);
    this.toastComponentRef = componentFactory.create(this.injector);
    this.toastComponentRef.instance.message = message;
    this.toastComponentRef.instance.type = type;
  
    this.appRef.attachView(this.toastComponentRef.hostView);
    const domElem = (this.toastComponentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
    document.body.appendChild(domElem);
  
    // Log the created element
    console.log('Toast element created:', domElem);
  
    // Trigger change detection
    this.toastComponentRef.changeDetectorRef.detectChanges();
  
    setTimeout(() => {
      this.hideToast();
    }, 3000);
  }

  private hideToast() {
    if (this.toastComponentRef) {
      this.appRef.detachView(this.toastComponentRef.hostView);
      this.toastComponentRef.destroy();
      this.toastComponentRef = null;
    }
  }
}
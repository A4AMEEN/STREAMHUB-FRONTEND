/* eslint-disable @typescript-eslint/consistent-indexed-object-style */
import { Injectable } from '@angular/core';
import { Storage } from '../component/Enums & Constraints/storage.token';

class InMemoryStorage implements Storage {
  private storage: { [key: string]: string } = {};

  getItem(key: string): string | null {
    return this.storage[key] || null;
  }

  setItem(key: string, value: string): void {
    this.storage[key] = value;
  }

  removeItem(key: string): void {
    delete this.storage[key];
  }
}

@Injectable({
  providedIn: 'root'
})
export class FallbackStorageService implements Storage {
  private storage: Storage;

  constructor() {
    this.storage = this.isLocalStorageAvailable() ? window.localStorage : new InMemoryStorage();
  }

  private isLocalStorageAvailable(): boolean {
    try {
      const testKey = '__test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }

  getItem(key: string): string | null {
    return this.storage.getItem(key);
  }

  setItem(key: string, value: string): void {
    this.storage.setItem(key, value);
  }

  removeItem(key: string): void {
    this.storage.removeItem(key);
  }
}
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoryService } from '../../../../services/category.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Message } from '../../../Types/channelTypes';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit, OnDestroy {
  categories: { name: string, _id: string }[] = [];
  categoryForm: FormGroup;
  editMode = false;
  addMode = false;
  editIndex: number | null = null;
  errorMessage: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(private fb: FormBuilder, private categoryService: CategoryService) {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern('^[a-zA-Z]+( [a-zA-Z]+)*$')]]
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  

  get name() {
    return this.categoryForm.get('name');
  }

  loadCategories() {
    this.categoryService.getCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categories: { name: string; _id: string }[]) => {
          this.categories = categories;
        },
        error: (error: string) => {
          console.error('Error fetching categories:', error);
        }
      });
  }

  addCategory() {
    this.addMode = true;
    this.editMode = false;
    this.categoryForm.reset();
    this.errorMessage = null;
  }

  editCategory(index: number) {
    this.editMode = true;
    this.addMode = false;
    this.editIndex = index;
    this.categoryForm.patchValue({
      name: this.categories[index].name
    });
    this.errorMessage = null;
  }

  saveCategory() {
    if (this.categoryForm.invalid) {
      return;
    }

    const categoryName = this.categoryForm.value.name.trim();

    if (this.editMode && this.editIndex !== null) {
      const categoryId = this.categories[this.editIndex]._id;
      this.categoryService.updateCategory(categoryId, categoryName)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res: Message) => {
            
            this.categories[this.editIndex!].name = categoryName;
            this.cancelEdit();
            alert(res.message);
          },
          error: (error) => {
            console.error('Error updating category:', error);
            this.errorMessage = error.error.message || 'Error updating category.';
          }
        });
    } else {
      this.categoryService.addCategory(categoryName)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res: Message) => {
            this.categories.push({ name: categoryName, _id: res._id });
            this.cancelEdit();
            alert(res.message);
          },
          error: (error) => {
            console.error('Error adding category:', error);
            this.errorMessage = error.error.message || 'Error adding category.';
          }
        });
    }
  }

  cancelEdit() {
    this.editMode = false;
    this.addMode = false;
    this.editIndex = null;
    this.categoryForm.reset();
    this.errorMessage = null;
  }

  removeCategory(index: number) {
    const categoryId = this.categories[index]._id;
    this.categoryService.deleteCategory(categoryId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.categories.splice(index, 1);
          alert(res.message);
        },
        error: (error) => {
          console.error('Error deleting category:', error);
          this.errorMessage = error.error.message || 'Error deleting category.';
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Post } from '../../../../../shared/src/types/post'
import {RouterModule} from '@angular/router';

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './post.component.html',
  styleUrl: './post.component.css'
})
export class PostComponent {
  @Input() post!: Post;

  truncatedContent(): string {
    const maxLength = 100;
    return this.post.content.length > maxLength
      ? this.post.content.substring(0, maxLength) + '...'
      : this.post.content;
  }


}

import { Component } from '@angular/core';
import { CreatePostComponent } from '../create-post/create-post.component';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [CreatePostComponent],
  templateUrl: './jobs.component.html',
  styleUrl: './jobs.component.css'
})
export class JobsComponent {

}

import { Routes } from '@angular/router';
import { ApplicantsComponent } from './pages/applicants/applicants.component';
import { CreateJobComponent } from './pages/create-job/create-job.component';
import { CreatePostComponent } from './pages/create-post/create-post.component';
import { CreateResourceComponent } from './pages/create-resource/create-resource.component';
import { EditProfileComponent } from './pages/edit-profile/edit-profile.component';
import { ForumComponent } from './pages/forum/forum.component';
import { HomeComponent } from './pages/home/home.component';
import { JobDetailsComponent } from './pages/job-details/job-details.component';
import { JobListingComponent } from './pages/job-listing/job-listing.component';
import { JobsComponent } from './pages/jobs/jobs.component';
import { LoginComponent } from './pages/login/login.component';
import { MyJobsComponent } from './pages/my-jobs/my-jobs.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { PostDetailsComponent } from './pages/post-details/post-details.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { RegisterComponent } from './pages/register/register.component';
import { MessagesComponent } from './pages/messages/messages.component';
import { ChatsComponent } from './pages/chats/chats.component';
import { ResourceDetailsComponent } from './pages/resource-details/resource-details.component';
import { ResourcesComponent } from './pages/resources/resources.component';
import { TransactionComponent } from './pages/transaction/transaction.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'jobs', component: JobsComponent },
  { path: 'jobs/:id', component: JobDetailsComponent },
  { path: 'applicants', component: ApplicantsComponent },
  { path: 'job-listing', component: JobListingComponent },
  { path: 'my-jobs', component: MyJobsComponent },
  { path: 'create-job', component: CreateJobComponent },
  { path: 'user/:id', component: ProfileComponent },
  { path: 'edit-profile', component: EditProfileComponent },
  { path: 'forum', component: ForumComponent },
  { path: 'post/:id', component: PostDetailsComponent },
  { path: 'create-post', component: CreatePostComponent },
  { path: 'chat/:id', component:MessagesComponent} ,
  { path: 'chats', component:ChatsComponent} ,
  { path: 'resources', component: ResourcesComponent },
  { path: 'resource/:id', component: ResourceDetailsComponent },
  { path: 'create-resource', component: CreateResourceComponent },
  { path: 'transaction/:id', component:TransactionComponent},
  { path: '**', component: NotFoundComponent },
];

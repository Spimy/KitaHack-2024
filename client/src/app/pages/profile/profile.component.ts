import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MarkdownModule, MarkdownPipe } from 'ngx-markdown';
import { ToastrService } from 'ngx-toastr';
import {
  EMPTY,
  concatMap,
  expand,
  from,
  map,
  mergeMap,
  of,
  switchMap,
  toArray,
} from 'rxjs';
import { LoaderComponent } from '../../components/loader/loader.component';
import { MiniInfoCardComponent } from '../../components/mini-info-card/mini-info-card.component';
import { SummaryCardComponent } from '../../components/summary-card/summary-card.component';
import { JobDetails, JobService } from '../../services/job.service';
import { SkillsService } from '../../services/skills.service';
import {
  UserResponse,
  UserStoreService,
} from '../../services/user-store.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    LoaderComponent,
    SummaryCardComponent,
    MiniInfoCardComponent,
    MarkdownModule,
    MarkdownPipe,
    CommonModule,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  public user = signal<UserResponse | undefined>(undefined);
  public jobsApplied = signal<JobDetails[]>([]);
  public openModal = signal<boolean>(false);
  public jobOfferId = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private skillsService: SkillsService,
    private jobService: JobService,
    private toastr: ToastrService,
    public userStore: UserStoreService,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return this.router.navigate(['404']);

    this.userService
      .getUser(id)
      .pipe(
        mergeMap((user) => {
          const skillIds = Array.from(new Set(user.profile.skills));

          return from(skillIds).pipe(
            concatMap((skillId) => this.skillsService.getSkill(skillId)),
            map((skill) => skill.name),
            toArray(),
            switchMap((skills) => {
              user.profile.skills = skills;
              return of(user);
            }),
          );
        }),
      )
      .subscribe({
        next: (user) => {
          this.user.set(user);
          if (this.userStore.user?.uid === user.uid) this.userStore.user = user;
        },
        complete: () => {
          // Get all jobs user applied to
          let nextPageToken: string | undefined = '';
          this.jobService
            .getJobList(nextPageToken)
            .pipe(
              expand((response) =>
                typeof response.nextPageToken === 'undefined'
                  ? EMPTY
                  : this.jobService.getJobList(nextPageToken),
              ),
            )
            .subscribe({
              next: (response) => {
                response.jobs.forEach((job) => {
                  if (job.applicants?.includes(this.user()!.uid ?? '')) {
                    if (this.jobsApplied().includes(job)) return;
                    this.jobsApplied().push(job);
                  }
                });
                nextPageToken = response.nextPageToken;
              },
            });
        },
        error: () => this.router.navigate(['404']),
      });

    return;
  }

  containsBusiness() {
    return this.jobsApplied().some(
      (job) => job.businessId === this.userStore.user?.uid,
    );
  }

  submitOfferForm() {
    if (!this.jobOfferId) {
      return this.toastr.warning('No position selected.');
    }

    this.userService.addOffer(this.user()!.uid, this.jobOfferId).subscribe({
      next: (response) => this.toastr.success(response.message),
      complete: () => this.removeApplicants(),
    });
    return;
  }

  removeApplicants(message?: string) {
    from(
      this.jobsApplied().filter(
        (job) => job.businessId === this.userStore.user?.uid,
      ),
    )
      .pipe(
        mergeMap((job) => {
          return this.jobService.editJob(job.id, {
            applicants: job.applicants.filter(
              (applicant) => applicant !== this.user()?.uid,
            ),
          });
        }),
      )
      .subscribe({
        complete: () => {
          this.jobsApplied.set([]);
          this.ngOnInit();
          if (message) this.toastr.success(message);
        },
      });
  }
}

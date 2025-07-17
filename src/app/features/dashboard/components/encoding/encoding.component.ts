import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, finalize } from 'rxjs';
import { EncodingService } from '../../../admin/services/encodings.service';
import { FormsModule } from '@angular/forms';
import { EncodingStateService } from '../../services/encoding-state.service';
import { UpdateEncodingProfileModalComponent } from "../../../admin/updateModal/encodingprofilemodal.component";
import { HasRoleDirective } from '../../../../shared/directives/has-role';
import { EncodingProfile } from '../../../../core/models/encoding-profile.model';

@Component({
  selector: 'app-encoding-table',
  standalone: true,
  imports: [CommonModule, FormsModule, HasRoleDirective, UpdateEncodingProfileModalComponent],
  templateUrl: './encoding.component.html',
  styleUrls: ['./encoding.component.css']
})
export class EncodingTableComponent implements OnInit, OnDestroy {
  encodings: EncodingProfile[] = [];
  total = 0;
  page = 1;
  pageSize = 5;
  loading = false;
  error: string | null = null;
  showModal = false;
  selectedProfile: EncodingProfile | null = null;

  private destroy$ = new Subject<void>();

  constructor(private encodingService: EncodingService, private cdRef: ChangeDetectorRef, private encodingState: EncodingStateService) { }
  selectedProfileId: number | null = null;

  openModal(profile: EncodingProfile): void {
    this.selectedProfile = profile;
    this.showModal = true;
  }
  onModalClosed() {
    this.showModal = false;
  }

  onProfileCreated(profile: any) {
    console.log('Profile created in parent:', profile);
    this.showModal = false;
    this.cdRef.detectChanges();
    // You can now store, display, or send this profile to the backend
  }

  onProfileSelected(profileId: number) {
    console.log("✅ Selected Profile ID:", profileId);
    this.encodingState.setSelectedProfileId(profileId);
  }

  onDelete(id: number): void {
    const profile = this.encodings.find(p => p.id === id);
    const name = profile?.name || 'this profile';

    const confirmed = confirm(`Are you sure you want to delete profile "${name}"?`);
    if (!confirmed) return;

    this.encodingService.deleteEncodingProfile(id).subscribe({
      next: () => {
          this.fetchEncodings(); 
                this.cdRef.detectChanges();

        console.log(`✅ Encoding profile deleted: ID ${id}`);
        // Remove the deleted profile from the local list
      },
      error: (err) => {
        console.error(`❌ Failed to delete encoding profile:`, err);
      }
    });
  }

  ngOnInit(): void {
    this.fetchEncodings();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Fetch encoding profiles from the service
   */
  fetchEncodings(): void {
    this.loading = true;
    this.error = null;

    this.encodingService
      .getAllEncodingProfiles(this.page, this.pageSize)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (res) => {
          this.encodings = res.items || [];
          this.total = res.total || 0;
          this.loading = false;
          this.cdRef.detectChanges();

        },
        error: (error) => {
          console.error('Failed to load encoding profiles:', error);
          this.error = 'Failed to load encoding profiles. Please try again.';
          this.encodings = [];
          this.total = 0;
        }
      });
  }

  /**
   * Navigate to the next page
   */
  nextPage(): void {
    if (this.canGoToNextPage()) {
      this.page++;
      this.fetchEncodings();

    }
  }

  /**
   * Navigate to the previous page
   */
  prevPage(): void {
    if (this.canGoToPreviousPage()) {
      this.page--;
      this.fetchEncodings();

    }
  }

  /**
   * Get the total number of pages
   */
  getTotalPages(): number {
    return Math.ceil(this.total / this.pageSize);
  }

  /**
   * Check if we can go to the next page
   */
  canGoToNextPage(): boolean {
    return (this.page * this.pageSize) < this.total;
  }

  /**
   * Check if we can go to the previous page
   */
  canGoToPreviousPage(): boolean {
    return this.page > 1;
  }

  /**
   * Get the current page range info
   */
  getPageRangeInfo(): string {
    const start = (this.page - 1) * this.pageSize + 1;
    const end = Math.min(this.page * this.pageSize, this.total);
    return `${start}-${end} of ${this.total}`;
  }

  /**
   * Refresh the current page
   */
  refresh(): void {
    this.fetchEncodings();
  }

  /**
   * Handle page size change
   */
  onPageSizeChange(newPageSize: number): void {
    this.pageSize = newPageSize;
    this.page = 1; // Reset to first page
    this.fetchEncodings();
  }

  /**
   * Track by function for ngFor performance
   */
  trackByEncodingId(index: number, profile: EncodingProfile): any {
    return profile.id || index;
  }
}
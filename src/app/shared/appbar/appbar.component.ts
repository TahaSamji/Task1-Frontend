import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { EncodingProfileModalComponent } from "../../features/admin/modal/encodingprofilemodal.component";

@Component({
  selector: 'app-appbar',
  standalone: true,
  imports: [CommonModule, RouterModule, EncodingProfileModalComponent],
  templateUrl: './appbar.component.html',
  styleUrls: ['./appbar.component.css']
})
export class AppbarComponent {
    showModal = false;
  constructor(private router: Router) {}
  scrollTo(sectionId: string) {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  }

    openModal() {
    this.showModal = true;
  }

  onModalClosed() {
    this.showModal = false;
  }

   onProfileCreated(profile: any) {
    console.log('Profile created in parent:', profile);
    this.showModal = false;
    // You can now store, display, or send this profile to the backend
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/auth/login']); // or your actual login route
  }
}

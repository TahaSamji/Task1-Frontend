import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-appbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './appbar.component.html',
  styleUrls: ['./appbar.component.css']
})
export class AppbarComponent {
  constructor(private router: Router) {}
  scrollTo(sectionId: string) {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  }
  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/auth/login']); // or your actual login route
  }
}

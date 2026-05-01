import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-role-redirect',
  standalone: true,
  template: ''
})
export class RoleRedirectComponent implements OnInit {
  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    const role = this.authService.userRole;

    if (!role) {
      // Not logged in - go to guest dashboard
      this.router.navigate(['/customer/dashboard']);
      return;
    }

    switch (role.toLowerCase()) {
      case 'admin':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'partner':
        this.router.navigate(['/partner/dashboard']);
        break;
      case 'deliveryagent':
      case 'delivery':
        this.router.navigate(['/delivery/dashboard']);
        break;
      case 'customer':
      default:
        this.router.navigate(['/customer/dashboard']);
        break;
    }
  }
}

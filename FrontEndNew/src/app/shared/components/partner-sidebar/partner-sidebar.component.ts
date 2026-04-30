import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { Restaurant } from '../../../core/services/partner.service';

@Component({
  selector: 'app-partner-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './partner-sidebar.component.html',
  styleUrls: ['./partner-sidebar.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PartnerSidebarComponent {
  @Input() selectedRestaurant: Restaurant | null = null;
  @Input() restaurants: Restaurant[] = [];
  @Input() restaurantName = '';

  @Output() restaurantSelected = new EventEmitter<Restaurant>();
  @Output() logoutClicked = new EventEmitter<void>();

  showRestaurantDropdown = false;
  isMobileMenuOpen = false;

  constructor(private authService: AuthService, private router: Router) {}

  selectRestaurant(r: Restaurant): void {
    this.restaurantSelected.emit(r);
    this.showRestaurantDropdown = false;
  }

  logout(): void {
    this.logoutClicked.emit();
  }
}

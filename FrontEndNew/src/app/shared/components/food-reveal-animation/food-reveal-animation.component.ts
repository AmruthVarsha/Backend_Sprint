import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-food-reveal-animation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './food-reveal-animation.component.html',
  styleUrls: ['./food-reveal-animation.component.css']
})
export class FoodRevealAnimationComponent implements OnInit, AfterViewInit {
  @ViewChild('section') section!: ElementRef;
  isVisible = false;

  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.triggerAnimation();
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0, rootMargin: '50px' }
    );

    observer.observe(this.section.nativeElement);

    // If already in view (common for hero), trigger immediately
    if (this.section.nativeElement.getBoundingClientRect().top < window.innerHeight) {
      this.triggerAnimation();
    }

    // Fallback: If not triggered after 500ms, trigger anyway
    setTimeout(() => {
      if (!this.isVisible) {
        this.triggerAnimation();
      }
    }, 500);
  }

  private triggerAnimation(): void {
    this.isVisible = true;
  }

  scrollToContent(): void {
    const mainContent = document.querySelector('main');
    if (mainContent) {
      mainContent.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

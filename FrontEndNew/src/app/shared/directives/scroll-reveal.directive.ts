import { Directive, ElementRef, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appScrollReveal]',
  standalone: true
})
export class ScrollRevealDirective implements OnInit {
  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.renderer.addClass(this.el.nativeElement, 'in-view');
          // Once the animation is triggered, we can stop observing
          observer.unobserve(this.el.nativeElement);
        }
      });
    }, { 
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px' // Trigger slightly before it fully enters
    });

    observer.observe(this.el.nativeElement);
  }
}

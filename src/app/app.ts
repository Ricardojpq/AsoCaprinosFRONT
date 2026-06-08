import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { NotificationService } from '@core/services/notification.service';
import { TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-root',
  imports: [RouterModule, ToastModule],
  providers: [MessageService],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private readonly messageService = inject(MessageService);
  private readonly notifications = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly transloco = inject(TranslocoService);

  ngOnInit(): void {
    const savedLang = localStorage.getItem('lang');
    if (savedLang && ['es', 'en'].includes(savedLang)) {
      this.transloco.setActiveLang(savedLang);
    }

    // Puente NotificationService -> PrimeNG Toast global.
    this.notifications.stream$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(n => {
        this.messageService.add({
          severity: n.severity,
          summary: n.summary,
          detail: n.detail,
          life: n.life,
          sticky: n.sticky,
        });
      });
  }
}

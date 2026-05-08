import { Component, inject } from '@angular/core';
import { Location } from '@angular/common';
import { SHARED_IMPORTS } from '../../../shared/shared-imports';

@Component({
  selector: 'app-reports-detail-screen',
  standalone: true,
  imports: [SHARED_IMPORTS],
  templateUrl: './reports-detail-screen.html',
  styleUrl: './reports-detail-screen.scss'
})
export class ReportsDetailScreen {
  public location = inject(Location);

  public goBack(): void {
    this.location.back();
  }
}

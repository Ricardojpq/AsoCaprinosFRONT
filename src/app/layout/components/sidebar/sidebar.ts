import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule, Home, ChevronLeft, ChevronRight, User, Award, PawPrint,Users,SlidersHorizontal,Settings } from 'lucide-angular';
import { LayoutService } from '@layout/services/layout-service';
import { MenuItem } from '@core/models/menu-item';
import { Menu } from "@shared/components/menu/menu";

@Component({
  selector: 'app-sidebar',
  imports: [RouterModule, LucideAngularModule, Menu],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar implements OnInit {
  readonly homeIcon = Home;
  readonly chevronLeftIcon = ChevronLeft;
  readonly chevronRightIcon = ChevronRight;
  readonly userIcon = User;
  readonly awardIcon = Award;
  readonly pawPrintIcon = PawPrint;
  readonly usersIcon = Users;
  readonly slidersHorizontalIcon = SlidersHorizontal;
  readonly settingsIcon = Settings;



  constructor(public layoutService: LayoutService, public router: Router,public el: ElementRef) { }

  ngOnInit() {
  }
}
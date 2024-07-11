import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.css']
})

export class SideNavComponent extends AppComponent {

  @Input() isOpen=false;
  @Output() toggle = new EventEmitter<void>();


  toggleSidebar(){

    //this.isOpen=!this.isOpen;
    this.toggle.emit();

    // const btnToggleSidebar = document.getElementById('btnToggleSidebar');

    // if (window.getComputedStyle(btnToggleSidebar).display==='none') {
    //   //alert('El btn del sidebar esta oculto');
    // } else {
    //   //alert('El btn del sidebar NO esta oculto');
    //   btnToggleSidebar.click();
    // }
  }

  onNavItemClick(){
    if (window.innerWidth < 640) { // sm breakpoint in Tailwind CSS is 640px
      this.toggle.emit();
    }
  }


}

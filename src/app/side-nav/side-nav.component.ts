import { Component, OnInit } from '@angular/core';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.css']
})

export class SideNavComponent extends AppComponent {

  toggleSidebar(){
    const btnToggleSidebar = document.getElementById('btnToggleSidebar');

    if (window.getComputedStyle(btnToggleSidebar).display==='none') {
      //alert('El btn del sidebar esta oculto');
    } else {
      //alert('El btn del sidebar NO esta oculto');
      btnToggleSidebar.click();
    }
  }


}

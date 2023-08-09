
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Area } from './area';
import { Campus } from './campus';
import { CookiesService } from './cookies.service';
import { User } from './user';
import { UsersService } from './users.service';
import { LogisticaService } from './logistica.service';
import { MatSidenav } from '@angular/material/sidenav';
import { Collaborator } from './collaborator';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  user: User = new User(0,'','','','','','','','','','','','','','','','','',0,'','','');
  colab: Collaborator = new Collaborator(0,0,'',0,'','','','','','','','','');
  user_area: Area = new Area('',null);
  user_campus: Campus = new Campus('','','','','','');

  user_id: number = 0;
  user_role: string = '';
  logged;

  @ViewChild(MatSidenav) sidenav!: MatSidenav;


  constructor(private router: Router, private usersService:UsersService,
              private logisticaService:LogisticaService,
              private cookiesService:CookiesService,){}

  logout(){
    this.cookiesService.deleteToken('user_id');
    this.cookiesService.deleteToken('user_role');
    location.reload();
  }

  ngOnInit() {
    if(this.cookiesService.checkToken('user_id')){
      this.user_id=parseInt(this.cookiesService.getToken('user_id'));
      this.user_role=this.cookiesService.getToken('user_role');

      this.usersService.getUserByIdNew(this.user_id).subscribe((u:User)=>{
        console.log(u);

        this.sidenav.open();
        console.log(window.innerWidth)
        if(window.innerWidth<500){
          this.sidenav.close();
        }

        this.user=u;
        this.usersService.getCollaboratorById(this.user.colab_id).subscribe((c:Collaborator)=>{
          console.log(c);
          this.colab=c;
        })

      });


    }
    else{
      this.router.navigateByUrl('/login');
    }
  }
}



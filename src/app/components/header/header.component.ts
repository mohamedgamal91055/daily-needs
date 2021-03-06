import { NotifierService } from 'angular-notifier';
import { Router } from '@angular/router';
import { CartService } from './../../shared/services/cart.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { LangService } from './../../shared/services/lang.service';
import { TranslateService } from '@ngx-translate/core';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ModalSignupComponent } from '../modal-signup/modal-signup.component';
import { ModalSigninComponent } from '../modal-signin/modal-signin.component';
import { Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  isLogged: boolean;
  showSignIn = false;
  lang: string;
  environment = environment;
  subscription: Subscription = new Subscription();
  constructor(
    private translate: TranslateService,
    private langS: LangService,
    private modalService: NgbModal,
    public authService: AuthService,
    public cartService: CartService,
    private router: Router,
    private notifierService: NotifierService
  ) {
    this.subscription.add(
      this.langS.lang.subscribe(lang => {
        this.lang = lang;
        this.translate.use(lang);
      }));
  }

  ngOnInit() {

  }

  changeLang() {
    if (this.lang === 'ar') {
      this.langS.changeLang('en');
      this.translate.use('en');
    } else {
      this.langS.changeLang('ar');
      this.translate.use('ar');
    }
  }
  showModal(modalType) {
    if (modalType === 'signup') {
      this.modalService.open(ModalSignupComponent);
    } else if (modalType === 'signIn') {
      this.modalService.open(ModalSigninComponent);
    }

  }
  updateImage(ev) {
    ev.target.src = 'assets/images/default_image.png';
  }
  gotoCheckout() {
    if (this.authService.isLoggedIn) {
      this.router.navigate(['/cart/checkout']);
    } else {
      const loginTxt = this.lang === 'en' ? 'kindlly login or signup' : 'من فضلك قم بالتسجيل او تسجيل الدخول';
      this.notifierService.notify('success', loginTxt);
      document.querySelectorAll('[aria-labelledby="navbarDropdown"]')[1].classList.add('show');

    }
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}

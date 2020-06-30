import { AuthService } from './../../shared/services/auth.service';
import { ApiInterceptorService } from './../../shared/interceptor/api-interceptor.service';
import { Component, OnDestroy } from '@angular/core';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { LangService } from 'src/app/shared/services/lang.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription, Observable } from 'rxjs';
import { IloginedUserData } from 'src/app/shared/models/logined-user-data';
import { RefreshTokenService } from 'src/app/shared/services/refreshtoken.service';


@Component({
  selector: 'app-modal-signup',
  templateUrl: './modal-signup.component.html',
  styleUrls: ['./modal-signup.component.css']
})
export class ModalSignupComponent implements OnDestroy {
  subscription: Subscription = new Subscription();
  verId: number;
  mobile;
  signupForm: FormGroup;
  verficationForm: FormGroup;
  showVer: boolean;
  userData: any;
  language: string;
  constructor(
    public activeModal: NgbActiveModal,
    private langS: LangService,
    private translate: TranslateService,
    private formBuilder: FormBuilder,
    private api: ApiInterceptorService,
    private authService: AuthService,
    private refreshToken: RefreshTokenService
  ) {
    this.subscription.add(
      this.langS.lang.subscribe(lang => {
        this.translate.use(lang);
        this.language = lang;
      }));
    this.signupForm = this.formBuilder.group({
      email: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required]],
      cPassword: [null, [Validators.required]],
      fname: [null, [Validators.required]],
      lname: [null, [Validators.required]],
      phone: [null, [Validators.required, Validators.pattern('^[0-9]*$')]],
    },
      {
        validator: this.checkPasswordMatching
      }
    );
    this.verficationForm = this.formBuilder.group({
      code: [null, [Validators.required]]
    });
  }
  checkPasswordMatching(form: FormGroup) {
    const pass = form.get('password').value;
    const cPass = form.get('cPassword').value;
    return pass === cPass ? null : { passwordNotMAtched: true };
  }
  signup(value) {
    this.mobile = '+2' + value.phone;
    this.userData = value;
    this.userData.phone = this.mobile;
    const reqBody = {
      'clientRegister': {
        'channelInfo': {
          'AcquirerCountry': '818',
          'merchantName': 'android|9|86ea2fca-f89c-4a84-bb27-af7c565a7793|1.0.0'
        },
        'clientInfo': {
          'mobileNumber': this.mobile
        },
        'createOnClient': '002',
        'institutionNumber': '00000002',
        'processCode': '100000',
        'sourceID': '702000110001'
      },
      'serviceName': 'WSIOrderClientinfo'
    };
    console.log(JSON.stringify(reqBody));
    this.api.call('POST', reqBody).then((obs: Observable<any>) => {
      obs.subscribe((res: any) => {
        console.log(res);
        this.verId = res.clientRegisterResponse.verificationHistID;
        this.showVer = true;
      });
    });
  }


  verfication(vCode) {
    const verBody = {
      'clientRegister': {
        'channelInfo': {
          'AcquirerCountry': '818',
          'merchantName': 'android|9|847d6aff-caa2-40cb-af80-63ecc9c74469|1.0.0'
        },
        'clientInfo': {
          'mobileNumber': this.mobile
        },
        'createOnClient': '002',
        'institutionNumber': '00000002',
        'processCode': '101000',
        'sourceID': '702000110001',
        'verificationCode': vCode,
        'verificationHistID': this.verId
      },
      'serviceName': 'WSIOrderClientinfo'
    };
    this.api.call('POST', verBody).then((obs: Observable<any>) => {
      obs.subscribe((res: any) => {
        if (res) {
          this.updateProfile(vCode);
        }
      });
    });
  }
  updateProfile(vCode) {
    const reqBody = {
      'clientRegister': {
        'AcctCurrency': '818',
        'ClientoptIn': [
          {
            'Type': '001',
            'status': '001'
          },
          {
            'Type': '002',
            'status': '001'
          },
          {
            'Type': 'promoCode'
          }
        ],
        'authenticationType': '6',
        'channelInfo': {
          'AcquirerCountry': '818',
          'merchantName': 'android|9|66fe1944-36ab-4eb5-ade7-5672a1fa3f82|1.0.0'
        },
        'clientInfo': {
          'DoB': '20200629',
          'email': this.userData.email,
          'gender': '001',
          'lang': this.language,
          'mobileNumber': this.userData.phone,
          'password': this.userData.password,
          firstName: this.userData.fname,
          lastName: this.userData.lname,
          'shortName': this.userData.fname + ' ' + this.userData.lname
        },
        'createOnClient': '002',
        'institutionNumber': '00000002',
        'processCode': '110000',
        'sourceID': '702000110001',
        'verificationCode': vCode,
        'verificationHistID': this.verId
      },
      'serviceName': 'WSIOrderClientinfo'
    };
    console.log(reqBody.clientRegister.clientInfo);
    this.api.call('POST', reqBody).then((obs: Observable<IloginedUserData>) => {
      obs.subscribe((res: IloginedUserData) => {
        this.authService.loginedUserData = res;
        this.refreshToken.authToken = res.token;
        this.activeModal.dismiss('Cross click');
      });
    });
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}

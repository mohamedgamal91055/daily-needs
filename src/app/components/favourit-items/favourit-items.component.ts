import { ApiInterceptorService } from 'src/app/shared/interceptor/api-interceptor.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { environment } from './../../../environments/environment';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { IMenu, IresturentItemsInfo } from 'src/app/shared/models/menu';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { LangService } from 'src/app/shared/services/lang.service';
import { IFavouriteItemsRs, IitemsTab } from 'src/app/shared/models/favouriteItems';

@Component({
  selector: 'app-favourit-items',
  templateUrl: './favourit-items.component.html',
  styleUrls: ['./favourit-items.component.css']
})
export class FavouritItemsComponent implements OnInit, OnDestroy {
  menu: IMenu;
  isItemsLoaded: boolean;
  filterdCatArr: IresturentItemsInfo[];
  favItems: IresturentItemsInfo[];
  lang: string;
  subscription: Subscription = new Subscription();
  environment = environment;
  favouriteList: Array<IitemsTab> = [];
  constructor(private translate: TranslateService, private langS: LangService,
    private authService: AuthService,
    private api: ApiInterceptorService
  ) {
    this.subscription.add(
      this.langS.lang.subscribe(lang => {
        this.translate.use(lang);
        this.lang = lang;
      }));
  }

  ngOnInit() {
    this.getFavourite();
  }

  getFavourite() {
    const reqBody = {
      'getClientFavoriteItems': {
        'additionalInfo': {
          'areaID': '115',
          'lang': 'EN',
          'reservedData': '115'
        },
        'channelInfo': {
          'AcquirerCountry': '818',
          'merchantName': 'android|9|e33ae087-e918-4098-9a39-c242be683e6d|1.0.0'
        },
        'clientNumber': this.authService.loginedUserData.loginAuthenticationResponse.clientInfo.clientNumber,
        'institutionNumber': '00000002',
        'processCode': '170300',
        'sourceID': '702000110001'
      },
      'serviceName': 'WSIOrderClientinfo'
    };
    this.api.call('POST', reqBody).subscribe((res: IFavouriteItemsRs) => {
      if (res.getClientFavoriteItemsResponse) {
        const fav = res.getClientFavoriteItemsResponse.favoriteItemTab.itemsTab;
        if (Array.isArray(fav)) {
          this.favouriteList = fav;
        } else {
          this.favouriteList.push(fav);
        }
        this.isItemsLoaded = true;
      } else {
        setTimeout(() => {
          this.getFavourite();
        }, 500);
      }
    });
  }
  removeFav(id, i) {
    const reqBody = {
      'serviceName': 'WSIOrderClientinfo',
      'setClientFavoriteItems': {
        'additionalData': [
          {
            'lang': this.lang
          }
        ],
        'channelInfo': {
          'AcquirerCountry': '818',
          'merchantName': 'android|9|f8d1b93b-c788-48a2-8ee6-df829c07de5c|1.0.0'
        },
        'clientFavoriteItemTab': {
          'CLIENT_FAVOURITE_ITEM_ID': id,
          'CLIENT_NUMBER': this.authService.loginedUserData.loginAuthenticationResponse.clientInfo.clientNumber,
          'ITEM_ARABIC_NAME': 'ITEM NAME',
          'ITEM_ENGLISH_NAME': 'ITEM NAME',
          'ITEM_ID': id,
          'RESTAURANT_BRANCHE_ID': '4968',
          'RESTAURANT_ID': '3648',
          'STATUS_CODE': '001',
          'terminalID': '111'
        },
        'clientNumber': this.authService.loginedUserData.loginAuthenticationResponse.clientInfo.clientNumber,
        'institutionNumber': '00000002',
        'processCode': '170100',
        'sourceID': '702000110001'
      }
    };
    this.api.call('POST', reqBody).subscribe(res => {
      this.favouriteList.splice(i, 1)
    });
  }
  updateImage(ev) {
    ev.target.src = 'assets/images/default_image.png';
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}

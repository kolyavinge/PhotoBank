import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Locale, LocalizationService } from 'src/app/services/localization.service';
import { MatDialog } from '@angular/material/dialog';
import { PhotoApiService } from 'src/app/services/photo-api.service';
import { PhotoApiNotifierService } from 'src/app/services/photo-api-notifier.service';
import { UserEditModalComponent } from 'src/app/modals/user-edit-modal/user-edit-modal.component';
import Utils from 'src/utils';

@Component({
    selector: 'app-user-edit',
    templateUrl: './user-edit.component.html',
    styleUrls: ['./user-edit.component.css'],
    providers: [PhotoApiService, PhotoApiNotifierService]
})
export class UserEditComponent implements OnInit {

    locale: Locale;
    userName: string = "";
    userEmail: string = "";
    userPicture: string = "";

    constructor(
        private router: Router,
        private localizationService: LocalizationService,
        private photoApi: PhotoApiService,
        private photoApiNotifier: PhotoApiNotifierService,
        private modalService: MatDialog
    ) {
        var self = this;
        const clientId = Utils.getClientId();
        self.photoApi.setClientId(clientId);
        self.photoApiNotifier.setClientId(clientId);
        self.locale = self.localizationService.getLocale();
        self.localizationService.addChangeLanguageCallback(function () {
            self.locale = self.localizationService.getLocale();
        });
    }

    ngOnInit(): void {
        var self = this;

        self.photoApiNotifier.onGetUserInfoResponse(function (response) {
            if (!response || !response.success) {
                self.router.navigate(['/']);
            } else {
                self.userName = response.name;
                self.userEmail = response.email;
                self.userPicture = Utils.getImageFromBase64(response.pictureBase64Content);
            }
        });

        self.photoApiNotifier.start().then(function () {
            self.photoApi.getUserInfo();
        });
    }

    openUserEditModal(): void {
        var self = this;
        var modal = self.modalService.open(UserEditModalComponent);
        modal.afterClosed().subscribe(result => {
            if (result) {
                self.userName = modal.componentInstance.userName;
                self.userEmail = modal.componentInstance.userEmail;
                self.userPicture = modal.componentInstance.userPicture;
                // сохраняем данные пользователя
                self.photoApi.setUserInfo(modal.componentInstance.userName, modal.componentInstance.userEmail, modal.componentInstance.userAbout);
                // сохраняем новую картинку пользователя
                self.photoApi.setUserPicture(modal.componentInstance.newUserPictureId);
            }
        });
    }
}

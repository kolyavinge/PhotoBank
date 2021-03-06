import { Component, Input, OnInit } from '@angular/core';
import { Locale, LocalizationService } from 'src/app/services/localization.service';
import { PhotoApiNotifierService } from 'src/app/services/photo-api-notifier.service';
import { PhotoApiService } from 'src/app/services/photo-api.service';
import Utils from 'src/utils';

@Component({
    selector: 'app-photo-description-modal',
    templateUrl: './photo-description-modal.component.html',
    styleUrls: ['./photo-description-modal.component.css'],
    providers: [PhotoApiService, PhotoApiNotifierService]
})
export class PhotoDescriptionModalComponent implements OnInit {

    locale: Locale;
    photoId: number;
    @Input() photoDescription: string = "";

    constructor(
        private localizationService: LocalizationService,
        private photoApi: PhotoApiService,
        private photoApiNotifier: PhotoApiNotifierService
    ) {
        const clientId = Utils.getClientId();
        this.photoApi.setClientId(clientId);
        this.photoApiNotifier.setClientId(clientId);
        this.locale = this.localizationService.getLocale();
    }

    ngOnInit(): void {
    }

    setPhotoId(photoId): void {
        var self = this;
        self.photoId = photoId;
        self.photoApiNotifier.onGetPhotoAdditionalInfoResponse(function (response) {
            if (response && response.success) {
                self.photoDescription = response.additionalInfo.description;
            }
        });
        self.photoApiNotifier.start().then(function () {
            self.photoApi.getPhotoAdditionalInfo(self.photoId);
        });
    }

    save(): void {
        var self = this;
        self.photoApi.setPhotoAdditionalInfo(self.photoId, { description: self.photoDescription });
    }
}

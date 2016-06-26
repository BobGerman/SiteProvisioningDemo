declare namespace SPPageContext {

    export interface WebPermMasks {
        High: number;
        Low: number;
    }

    export interface Info {
        webServerRelativeUrl: string;
        webAbsoluteUrl: string;
        siteAbsoluteUrl: string;
        serverRequestPath: string;
        layoutsUrl: string;
        webTitle: string;
        webTemplate: string;
        tenantAppVersion: string;
        isAppWeb: boolean;
        hasManageWebPermissions: boolean;
        webLogoUrl: string;
        webLanguage: number;
        currentLanguage: number;
        currentUICultureName: string;
        currentCultureName: string;
        clientServerTimeDelta: number;
        updateFormDigestPageLoaded: Date;
        siteClientTag: string;
        crossDomainPhotosEnabled: boolean;
        webUIVersion: number;
        webPermMasks: WebPermMasks;
        pageListId: string;
        pageItemId: number;
        pagePersonalizationScope: number;
        userId: number;
        userLoginName: string;
        systemUserKey: string;
        isAnonymousGuestUser: boolean;
        alertsEnabled: boolean;
        siteServerRelativeUrl: string;
        allowSilverlightPrompt: string;
        themeCacheToken: string;
        themedCssFolderUrl: string;
        isSiteAdmin: boolean;
        env: string;
        ProfileUrl: string;
    }

}

interface Window {
    _spPageContextInfo: SPPageContext.Info;
}




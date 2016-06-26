declare namespace SPWebAllProperties {

    export interface Metadata {
        id: string;
        uri: string;
        type: string;
    }

    export interface D {
        __metadata: Metadata;
        vti_x005f_indexedpropertykeys: string;
        FollowLinkEnabled: string;
        vti_x005f_approvallevels: string;
        disabledhelpcollections: string;
        vti_x005f_defaultlanguage: string;
        OData__x005f_PnP_x005f_ProvisioningTemplateComposedLookInfo: string;
        taxonomyhiddenlist: string;
        vti_x005f_associategroups: string;
        siteSensitivity: string;
        enabledhelpcollections: string;
        siteProject: string;
        vti_x005f_sitemasterid: string;
        profileschemaversion: string;
        vti_x005f_associatemembergroup: string;
        OData__x005f__x005f_ScriptSafeInternalPages: string;
        siteLocation: string;
        vti_x005f_associateownergroup: string;
        vti_x005f_createdassociategroups: string;
        sharepointhelpoverride: string;
        OriginalNotebookUrl: string;
        vti_x005f_extenderversion: string;
        vti_x005f_categories: string;
        dlc_x005f_sitehasexpirationpolicy: string;
        allowslistpolicy: string;
        vti_x005f_associatevisitorgroup: string;
        vti_x005f_customuploadpage: string;
        metadatatimestamp: string;
        dlc_x005f_sitehaspolicy: string;
    }

    export interface Data {
        d: D;
    }

    export interface Headers {
        accept: string;
    }

    export interface Config {
        method: string;
        transformRequest: any[];
        transformResponse: any[];
        headers: Headers;
        url: string;
    }

    export interface RootObject {
        data: Data;
        status: number;
        config: Config;
        statusText: string;
    }

}


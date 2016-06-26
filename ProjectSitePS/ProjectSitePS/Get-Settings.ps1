#
# Settings for Project Site Provisioning scripts
#
[PSCustomObject]@{

	ScriptSiteUrl = "https://<yourtenant>.sharepoint.com/sites/DemoScripts";
    RootSite = "https://<yourtenant>.sharepoint.com";
    Lcid = 1033;
	ResourceQuotaWarningLevel = 0;
	ResourceQuota = 0;
	StorageQuotaWarningLevel = 30000;
	StorageQuota = 50000;
	Template = "STS#0";
	# Use Get-SPOTimeZoneId to get a list of time zones
	Timezone = 10;   # Eastern Standard Time
}
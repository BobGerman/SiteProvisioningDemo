#
# New_ProjectSite.ps1
#
[CmdletBinding()]
Param(
    [Parameter(ValueFromPipeline=$True)]
    [object]$Credentials,

	[Parameter(Mandatory=$True)]
	[string]$Title,
    
    [Parameter(Mandatory=$True)]
    [string]$Url,	

    [Parameter(Mandatory=$True)]
    [string]$Folder,	

    [Parameter(Mandatory=$True)]
    [string]$LogFile,	

	[Parameter(Mandatory=$True)]
	[string]$Description,
    
    [Parameter(Mandatory=$True)]
    [string]$SiteOwner1,

    [Parameter(Mandatory=$False)]
    [string]$SiteOwner2
)

Push-Location $folder

$settings = .\Get-Settings.ps1
$VerbosePreference = "continue"
$serverRelativeUrl = $url.Substring($url.IndexOf('/',8))    # Skip 8 characters for "https://"
$serverRelativeHomePageUrl = $serverRelativeUrl + '/SitePages/Home.aspx'

############################################################################
# Add-ListViewWebPart
############################################################################
function Add-ListViewWebPart ($serverRelativePageUrl, $webPartName, $listName, $isLibrary, $column, $row) {

    Write-Verbose "Adding web part $webPartName"

    $list = Get-SPOList -Identity $listName
	$listId = $list.Id.ToString().ToUpper()
	if ($isLibrary) {
	    $listUrl = $serverRelativeUrl + "/" + $listName
	} else {
	    $listUrl = $serverRelativeUrl + "/lists/" + $listName
	}
    $views = Get-SPOView -List $list | Where-Object {$_.DefaultView}
    $viewId = ($views[0]).Id.ToString().ToUpper()

	$webPartXml = ((Get-Content "./WebParts/$webPartName") `
                  | Foreach-Object {$_ -replace "%ListId%", $listId} `
                  | Foreach-Object {$_ -replace "%ViewId%", $viewId} `
                  | Foreach-Object {$_ -replace "%ListUrl%", "$listUrl"} `
                  | Foreach-Object {$_ -replace "%PageUrl%", $serverRelativePageUrl} `
                  )

    $webPartXml > temp.xml

	Add-SPOWebPartToWikiPage -Path ./temp.xml -ServerRelativePageUrl $serverRelativePageUrl -Row $row -Column $column
        
    Remove-Item -Path .\temp.xml
}

############################################################################
# Add-ColumnToListView
############################################################################
function Add-ColumnToListView ($listName, $fieldName) {

    $ctx = Get-SPOContext
    $list = Get-SPOList -Identity $listName
    $ctx.Load($list.Views)
    $ctx.ExecuteQuery()
    $view = $list.Views | Where-Object {$_.Title -eq ""}
    $view.ViewFields.Add($fieldName)
    $view.Update()
    $ctx.ExecuteQuery()

}

############################################################################
# Add-ScriptedWebPart
############################################################################
function Add-ScriptedWebPart ($serverRelativePageUrl, $webPartName, $scriptSite, $column, $row) {

    Write-Verbose "Adding web part $webPartName"

	$webPartXml = ((Get-Content "./WebParts/$webPartName") `
                  | Foreach-Object {$_ -replace "%ScriptSite%", $scriptSite} `
                  )

    $webPartXml > temp.xml

	Add-SPOWebPartToWikiPage -Path ./temp.xml -ServerRelativePageUrl $serverRelativePageUrl -Row $row -Column $column
        
    Remove-Item -Path .\temp.xml
}

############################################################################
# New-List
############################################################################
function New-List ($listTemplateName, $listName) {
    $web = Get-SPOWeb
    $ctx = Get-SPOContext
    $ctx.Load($web.ListTemplates)
    $ctx.ExecuteQuery()
    $listTemplate = $web.ListTemplates | Where-Object {$_.Name -eq $listTemplateName}
    New-SPOList -Title $listName -Template $listTemplate.ListTemplateTypeKind
    Write-Verbose "Created $listName"
}

############################################################################
# Site Provisioning (Inline code)
############################################################################

Write-Verbose "1   - Creating Site Collection"
Write-Verbose "1.1 - Connecting to main site collection"

Connect-SPOnline $settings.RootSite -Credentials $Credentials

Write-Verbose "1.2 - Creating new site collection $Url"

New-SPOTenantSite -Title $title `
				  -Url $url `
				  -Description $Description `
				  -Owner $Credentials.UserName `
				  -Lcid $settings.Lcid `
				  -Template $settings.Template `
				  -TimeZone $settings.Timezone `
				  -ResourceQuota $settings.ResourceQuota `
				  -ResourceQuotaWarningLevel $settings.ResourceQuotaWarningLevel `
				  -StorageQuota $settings.StorageQuota `
				  -StorageQuotaWarningLevel $settings.StorageQuotaWarningLevel `
				  -Wait

Write-Verbose "2   - Provisioning Site Contents"
Write-Verbose "2.1 - Connect to new site collection $url"

Connect-SPOnline $url -Credentials $Credentials

if ((Get-SPOWeb).Url.ToLower() -ne $url.ToLower()) {

    Write-Verbose "Unable to connect to new site collection $url"
    Write-Error "Unable to connect to new site collection $url"

} else {

    Write-Verbose "2.2 - Set Security Settings"
    if (($SiteOwner1 -ne $null) -and ($siteOwner1 -ne "")) {
        Write-Verbose "Setting secondary site collection administrator: $siteOwner1"
        $secondaryAdminUser = New-SPOUser -LoginName $siteOwner1
        $secondaryAdminUser.IsSiteAdmin = $true
        $secondaryAdminUser.Update()
    } else {
        Write-Verbose "Site Owner 1 not specified"
		Write-Error "Site Owner 1 not specified"
    }
    if (($SiteOwner2 -ne $null) -and ($siteOwner2 -ne "")) {
        Write-Verbose "Setting secondary site collection administrator: $siteOwner2"
        $secondaryAdminUser = New-SPOUser -LoginName $siteOwner2
        $secondaryAdminUser.IsSiteAdmin = $true
        $secondaryAdminUser.Update()
    } else {
        Write-Verbose "Site Owner 2 not specified"
    }

    Write-Verbose "2.3 - Creating lists"

    # Announcements List
    New-List -ListTemplateName "Announcements" -ListName "Announcements"
    $announcementsList = Get-SPOList -Identity "Announcements"
    Add-SPOField -List $announcementsList `
                 -DisplayName "Urgent" `
                 -InternalName "Urgent" `
                 -Type Boolean `
                 -AddToDefaultView
    
    # Calendar
    New-List -ListTemplateName "Calendar" -ListName "Calendar"

    Write-Verbose "2.4 - Disable MDS"
    Set-SPOMinimalDownloadStrategy -Off

    Write-Verbose "2.5 - Removing built-in web parts"

    $webParts = @("Get started with your site", "Site Feed", "Documents")

    foreach ($webPart in $webParts) {
        Write-Verbose "Removing web part $webPart"
        Remove-SPOWebPart -Title $webPart -ServerRelativePageUrl $serverRelativeHomePageUrl
    }

    # To create additional web part templates:
    #
    # 1. Add web part to a test or template master site
    # 2. Extract the XML with Get-SPOWebPartXml
    # 3. Edit the XML and replace the list GUID with %ListId%, view GUID with %ViewId%, and page URL with %PageUrl%

    Write-Verbose "2.6 - Adding new web parts"
    Add-ListViewWebPart -serverRelativePageUrl $serverRelativeHomePageUrl -webPartName "AnnouncementsWP.xml" -listName "Announcements" -isLibrary $False -column 1 -row 2
    Add-ColumnToListView -listName "Announcements" -fieldName "Urgent"
    Add-ListViewWebPart -serverRelativePageUrl $serverRelativeHomePageUrl -webPartName "CalendarWP.xml" -listName "Calendar" -isLibrary $False -column 1 -row 2
	Add-ScriptedWebPart -serverRelativePageUrl $serverRelativeHomePageUrl -webPartName "MetadataWP.xml" -scriptSite $settings.ScriptSiteUrl -column 2 -row 2
	Add-ScriptedWebPart -serverRelativePageUrl $serverRelativeHomePageUrl -webPartName "WeatherWP.xml" -scriptSite $settings.ScriptSiteUrl -column 2 -row 2
    Add-ListViewWebPart -serverRelativePageUrl $serverRelativeHomePageUrl -webPartName "DocumentsWP.xml" -listName "Shared%20Documents" -isLibrary $True -column 2 -row 2
  
    # Apply site branding - Very light, just a theme and logo

    Write-Verbose "2.7 - Adding branding"
    Set-SPOTheme -ColorPaletteUrl "$serverRelativeUrl/_catalogs/theme/15/palette013.spcolor" -FontSchemeUrl "$serverRelativeUrl/_catalogs/theme/15/fontscheme002.spfont"
    Write-Verbose "2.7.1 - Set theme"
    $ctx = Get-SPOContext
    $web = Get-SPOWeb
    $web.SiteLogoUrl = $settings.ScriptSiteUrl + "/SiteAssets/BlueMetalLogo.png"
    $web.Update()
    $ctx.ExecuteQuery()
    Write-Verbose "2.7.2 - Set logo"


    # Provision site metadata form

    Write-Verbose "2.8 - Adding site mtadata form"
    .\Add-MetadataForm.ps1 -Url $url -Credentials $Credentials

}

Pop-Location
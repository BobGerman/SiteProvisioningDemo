#
# Add-MetadataForm
#

[CmdletBinding()]
Param(
   [Parameter(Mandatory=$true,Position=1)]
   [string]$Url,	

   [Parameter(ValueFromPipeline=$True)]
   [object]$Credentials
)

# If credentials were not provided, get them now
if ($credentials -eq $null) {
    $credentials  = Get-Credential -Message "Enter Site Administrator Credentials"
}

$settings = .\Get-Settings.ps1

# Connect to the SharePoint site and add a folder for the app
Connect-PnPOnline -Url $Url -Credentials $Credentials

$scriptLinkUrl = $settings.ScriptSiteUrl + "/MetadataForm/checkMetadata.js"
Add-PnPJavaScriptLink -Key "MetaCapCheck" -Url $scriptLinkUrl

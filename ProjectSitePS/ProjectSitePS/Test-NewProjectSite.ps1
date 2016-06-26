#
# Test-NewProjectSite.ps1
#

if ($me -eq $null) {
	$me = Get-Credential -UserName "bobg@bgtest14.onmicrosoft.com" -Message "Enter your credentials"
}
$testNumber = "27"


.\New-ProjectSite.ps1 -Title "Project site $testNumber" `
                             -Credentials $me `
                             -Url "https://bgtest14.sharepoint.com/sites/DemoTest$testNumber" `
							 -Folder "C:\Users\bob\Source\Repos\Demos15\ProvisioningDemo\ProjectSitePS\ProjectSitePS" `
							 -LogFile "C:\Users\bob\Documents\Test\TestLog$testNumber.txt" `
							 -Description "Demo Site $testNumber" `
							 -SiteOwner1 "bobg@bgtest14.onmicrosoft.com" `
							 -SiteOwner2 "biz@bgtest14.onmicrosoft.com"


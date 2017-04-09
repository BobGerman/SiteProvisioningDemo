#
# Test-NewProjectSite.ps1
#

if ($me -eq $null) {
	$me = Get-Credential -UserName "admin@a830edad9050849canary022828.onmicrosoft.com" -Message "Enter your credentials"
}
$testNumber = "10"


.\New-ProjectSite.ps1 -Title "Project site $testNumber" `
                             -Credentials $me `
                             -Url "https://a830edad9050849canary022828.sharepoint.com/sites/t$testNumber" `
							 -Folder "C:\Users\bob\Source\Repos\SiteProvisioningDemo\ProjectSitePS\ProjectSitePS" `
							 -LogFile "C:\Users\bob\Documents\Test\TestLog$testNumber.txt" `
							 -Description "Demo Site $testNumber" `
							 -SiteOwner1 "admin@a830edad9050849canary022828.onmicrosoft.com" `
							 -SiteOwner2 "user0@a830edad9050849canary022828.onmicrosoft.com"


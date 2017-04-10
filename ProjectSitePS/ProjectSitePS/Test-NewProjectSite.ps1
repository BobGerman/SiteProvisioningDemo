#
# Test-NewProjectSite.ps1
#

if ($me -eq $null) {
	$me = Get-Credential -UserName "admin@a830edad9050849canary022828.onmicrosoft.com" -Message "Enter your credentials"
}
$testNumber = "1"


.\New-ProjectSite.ps1 -Title "Project site $testNumber" `
                             -Credentials $me `
                             -Url "https://<your tenant>.sharepoint.com/sites/t$testNumber" `
							 -Folder "C:\Users\<you>\Source\Repos\SiteProvisioningDemo\ProjectSitePS\ProjectSitePS" `
							 -LogFile "C:\Users\<you>\Documents\Test\TestLog$testNumber.txt" `
							 -Description "Demo Site $testNumber" `
							 -SiteOwner1 "<email address of 1st site collection admin>" `
							 -SiteOwner2 "<email address of 2nd site collection admin"


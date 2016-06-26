#
# Install-WeatherWidget
#

[CmdletBinding()]
Param(
   [Parameter(Mandatory=$False,Position=1)]
   [string]$Url,	

   [Parameter(ValueFromPipeline=$True)]
   [object]$Credentials
)

# If installation URL is not provided, get it from the settings file
$settings = .\Get-Settings.ps1
if ($Url -eq $null -or $Url -eq "") {
    $Url = $settings.ScriptSiteUrl
}

# If credentials were not provided, get them now
if ($credentials -eq $null) {
    $credentials  = Get-Credential -Message "Enter Site Administrator Credentials"
}

# Deploy-Files() - Function to deploy files in a local folder to SharePoint
Function Deploy-Files ($fromPath, $toPath)
{
	$filesToSkip = 'SampleFiles', 'Images', 'SharePointProjectItem.spdata'

	$fromItems = Get-ChildItem $fromPath
	foreach ($item in $fromItems) 
	{
		if ($filesToSkip -notcontains $item.Name)
		{
			# Handle templates by substituting tokens for script values
			if ($item.Name.EndsWith(".template"))
			{
				$scriptPath = $settings.ScriptSiteUrl

				# Remove .template from file name
				$itemFinalFullName = $item.FullName.Replace(".template", "")
				$itemFinalName = $item.Name.Replace(".template", "")

				# Replace tokens in template to build file
				(Get-Content $item.FullName) | 
				 Foreach-Object {$_ -replace "%ScriptPath%", $scriptPath} | 
				 Set-Content $itemFinalName

				# Upload the file
				Add-SPOFile -Path $itemFinalName -Folder $toPath
				Write-Host  "Deployed file: $spAppPath/$itemFinalName"

				# Clean up the file with the tokens replaced
				Remove-Item $itemFinalName
			}
			else
			{
				# No template, just copy the file
				$fullName = $item.FullName
				$fileName = $item.Name
				Add-SPOFile -Path $fullName -Folder "$toPath"
				Write-Host  "Deployed file: $fromPath/$fileName"
			}
		}
	}
}

# Connect to the script site and add a folder for the app
Write-Host "Provisioning weather widget to $Url"
Connect-SPOnline -Url $Url -Credentials $Credentials
New-SPOList -Title "Weather" -Template DocumentLibrary -Url "Weather"

# Define source and destinations for the copy, as well as SharePoint app packaging files
# that we don't need
$localAppPath = (Get-Item -Path .\Scripts).FullName
$spAppPath = "/Scripts"
$filesToSkip = ''

# Copy the app files to the folder
Deploy-Files $localAppPath $spAppPath

# Define source and destinations for the copy, as well as SharePoint app packaging files
# that we don't need
$localAppPath = (Get-Item -Path .\WeatherWidget).FullName
$spAppPath = "/Weather"

# Copy the app files to the folder
Deploy-Files $localAppPath $spAppPath

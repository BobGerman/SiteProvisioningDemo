<%-- The following 4 lines are ASP.NET directives needed when using SharePoint components --%>

<%@ Page Inherits="Microsoft.SharePoint.WebPartPages.WebPartPage, Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" MasterPageFile="~masterurl/default.master" Language="C#" %>

<%@ Register TagPrefix="Utilities" Namespace="Microsoft.SharePoint.Utilities" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register TagPrefix="WebPartPages" Namespace="Microsoft.SharePoint.WebPartPages" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register TagPrefix="SharePoint" Namespace="Microsoft.SharePoint.WebControls" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>

<%-- The markup and script in the following Content element will be placed in the <head> of the page --%>
<asp:Content ContentPlaceHolderID="PlaceHolderAdditionalPageHead" runat="server">
    <script type="text/javascript" src="../Scripts/jquery-1.9.1.min.js"></script>
    <SharePoint:ScriptLink Name="sp.core.js" runat="server" OnDemand="false" LoadAfterUI="true" Localizable="false"></SharePoint:ScriptLink>
    <SharePoint:ScriptLink Name="sp.js" runat="server" OnDemand="false" LoadAfterUI="true" Localizable="false"></SharePoint:ScriptLink>
    <script type="text/javascript" src="angular.1.3.14.min.js"></script>
    <script type="text/javascript" src="editMetadataController.js"></script>
    <meta name="WebPartPageExpansion" content="full" />
</asp:Content>

<%-- The markup in the following Content element will be placed in the TitleArea of the page --%>
<asp:Content ContentPlaceHolderID="PlaceHolderPageTitleInTitleArea" runat="server">
    Edit Site Metadata
</asp:Content>

<%-- The markup and script in the following Content element will be placed in the <body> of the page --%>
<asp:Content ContentPlaceHolderID="PlaceHolderMain" runat="server">

    <%-- Metadata Editing Form --%>
    <style>
        .metacapTermLabel { }

        .metacapTermInput, .metacapTermInput input {
            width: 150px;
        }

        .metacapTermInput select {
            width: 162px;
        }

        .metacapTermStatus {
            width: 50px;
            text-align: right;
        }

        .metacapMessage {
            color: red;
        }
    </style>

    <div ng-app="metacap">
        <div ng-controller="main as vm">
            <div ng-show="vm.showForm">
                <p>Editing metadata for site: <a href="{{vm.siteUrl}}">{{vm.siteUrl}}</a></p>
                <table>
                    <tr ng-repeat="term in vm.terms">
                        <td class="metacapTermLabel">{{term.name}}</td>
                        <td class="metacapTermInput">
                            <div ng-show="term.choices.length == 0">
                                <input type="text" ng-model="term.value" />
                            </div>
                            <div ng-show="term.choices.length > 0">
                                <select ng-model="term.value" ng-options="choice for choice in term.choices"></select>
                            </div>
                        </td>
                        <td class="metacapTermStatus"><span ng-show="term.saved">SAVED</span></td>
                    </tr>
                </table>
                <br />
                <input type="button" value="Save" ng-click="vm.save()" />
                <input type="button" value="Reload" ng-click="vm.load()" />
                <input type="button" value="Return to Site" ng-click="vm.returnToSite()" />
            </div>
            <br />
            <div class="metacapMessage">
                {{vm.message}}
            </div>
        </div>
    </div>
</asp:Content>

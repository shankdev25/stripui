sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";
        var uriInvoiceID, 
            uriCustomerID,
            redirect_status,
            oGlobalBusyDialog;

        return Controller.extend("com.deloitte.stripeui.controller.Payments", {
            onInit: function () {
                this._oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                this._oRouter.attachRoutePatternMatched(this._handleRouteMatched, this);
                oGlobalBusyDialog = new sap.m.BusyDialog();
            },
            _handleRouteMatched: function (oEvent) {
                if (oEvent.getParameter("name") !== "RoutePayments") {
                    return;
                } else {
                    oGlobalBusyDialog.open();
                    uriInvoiceID = jQuery.sap.getUriParameters().get("invoice");
                    uriCustomerID = jQuery.sap.getUriParameters().get("customer");
                    redirect_status= jQuery.sap.getUriParameters().get("status");
                    this.getView().byId("Success").setVisible(false);
                    this.getView().byId("Processing").setVisible(false);
                    if (uriInvoiceID !== undefined &&
                        uriInvoiceID !== null &&
                        redirect_status !== "succeeded") {
                        // if (uriInvoiceID.length > 12) {
                            uriInvoiceID = uriInvoiceID.substring(0, 12);
                        // }
                        this.getView().byId("InvID").setValue(uriInvoiceID);
                        this.getView().byId("vbox").setVisible(true);
                        this.getView().byId("CustVbox").setVisible(false);
                        // this.getView().byId("invoiceIdText").setText(uriInvoiceID);
                    }
                    else if (uriCustomerID !== undefined && 
                        uriCustomerID !== null &&
                        redirect_status !== "succeeded") {
                        // customer number can be of maximum 10 characters, if more than 10 chars are passed in the URL then
                        // truncate the customer number till the first 10 chars only
                        // if (uriCustomerID.length > 10) {
                            uriCustomerID = uriCustomerID.substring(0, 10);
                        // }
                        this.getView().byId("CustID").setValue(uriCustomerID);
                        this.getView().byId("vbox").setVisible(false);
                        this.getView().byId("CustVbox").setVisible(true);
                        // this.getView().byId("customerIdText").setText(uriCustomerID);
                    }
                    else if (redirect_status !== undefined &&
                        redirect_status !== null) {
                        // this.getView().byId("CustID").setValue(uriCustomerID);
                        this.getView().byId("vbox").setVisible(false);
                        if (redirect_status === "succeeded") {
                            this.getView().byId("Success").setVisible(true);
                            this.getView().byId("Processing").setVisible(false);
                            this.getView().byId("vbox").setVisible(false);
                            this.getView().byId("CustVbox").setVisible(false);
                        } else if (redirect_status === "processing") {
                            this.getView().byId("Processing").setVisible(true);
                            this.getView().byId("Success").setVisible(false);
                            this.getView().byId("vbox").setVisible(false);
                            this.getView().byId("CustVbox").setVisible(false);
                        }
                    }
                    oGlobalBusyDialog.close();
                }
            },
            getInvoiceData: function() {
                oGlobalBusyDialog.open();
                let oModel = this._getODataModel();
                // let sInvoiceNumber = uriInvoiceID;
                let sInvoiceNumber = this.getView().byId("InvID").getValue();
                var oModelJson = new sap.ui.model.json.JSONModel();
                let sPath = "/ETY_INVDETAILSSet('" + sInvoiceNumber + "')";
                oModel.read(sPath, {
                    success: function(oData) {
                        oGlobalBusyDialog.close();
                        oModelJson.setData(oData);
                        oModelJson.refresh();
                        this.getView().setModel(oModelJson, "InvoiceData");
                        // if (oData.valid_doc === "Y") {
                            this.getView().byId("SimpleForm").setVisible(true);
                        // } else {
                        //     this.getView().byId("SimpleForm").setVisible(false);
                        //     alert("You've attempted to open an invoice that does not exist, has already been paid or has been canceled.");
                        // }
                        var amt = this.getView().getModel("InvoiceData").getData().amount;
                        var submitButton = this.getView().byId("_IDGenButton1");
                        if(amt<=0){
                            submitButton.setEnabled(false);
                        } else{
                            submitButton.setEnabled(true);
                        }
                    }.bind(this),
                    error: function(oError) {
                        console.log("enter valid input");
                        oGlobalBusyDialog.close();
                    }
                });            
            },
            setPayment: function() {
                var iframeVisible = this.getView().byId("iframe");
                iframeVisible.destroyItems();
                iframeVisible.setVisible(true);
                var invNumber = "";
                if (this.getView().getModel("InvoiceData").getData().sap_invoice_id !== "") {
                    invNumber = this.getView().getModel("InvoiceData").getData().sap_invoice_id;
                } 
                var invAmount = this.getView().getModel("InvoiceData").getData().amount;
                var cCode = this.getView().getModel("InvoiceData").getData().sap_company_code;
                oGlobalBusyDialog.open();

                var url = "https://stripeservice.cfapps.us10.hana.ondemand.com/checkout.html?invoiceId=" + invNumber + "&"+ "amount=" + invAmount + "&"+ "cc=" + cCode ;
                iframeVisible.addItem(new sap.ui.core.HTML({
                    preferDOM: true,
                    content: "<iframe frameborder='0' allowpaymentrequest='true' scrolling='yes' allowfullscreen='true' allowtransparency='true' src='" + url + "' style='width:100%;height:700px;overflow:hidden' ></iframe>"
                }));
                oGlobalBusyDialog.close();
            },
            getCustomerData: function() {
                oGlobalBusyDialog.open();
                let oModel = this._getODataModel();
                let sCustomerNumber = uriCustomerID;
                var oModelJson = new sap.ui.model.json.JSONModel();
                let sPath = "/ETY_CUSTOMERDETLSet('" + sCustomerNumber + "')";
                oModel.read(sPath, {
                    success: function(oData) {
                        oGlobalBusyDialog.close();
                        oModelJson.setData(oData);
                        oModelJson.refresh();
                        this.getView().setModel(oModelJson, "CustomerData");
                        // if (oData.valid_doc === "Y") {
                            this.getView().byId("CustDetails").setVisible(true);
                        // } else {
                        //     this.getView().byId("SimpleForm").setVisible(false);
                        //     alert("You've attempted to open an invoice that does not exist, has already been paid or has been canceled.");
                        // }
                        var amt = this.getView().getModel("CustomerData").getData().amount;
                        if(amt<=0){
                            this.getView().byId("_IDGenButton2").setEnabled(false);
                        } else{
                            this.getView().byId("_IDGenButton2").setEnabled(true);
                        }
                    }.bind(this),
                    error: function(oError) {
                        console.log("enter valid input");
                        oGlobalBusyDialog.close();
                    }
                });          
            },
            setCustomerPayment: function() {
                var iframeVisible = this.getView().byId("iCustomerframe");
                // if (this.getView().byId("CustAmt").getValue() !== "" &&
                // this.getView().byId("CustAmt").getValue() !== "0" && 
                // this.getView().byId("CustAmt").getValue() !== "0.00") {
                    iframeVisible.destroyItems();
                    iframeVisible.setVisible(true);
                    var custAmt = this.getView().getModel("CustomerData").getData().amount;;
                    var customerNum = this.getView().getModel("CustomerData").getData().sap_cust_id;
                    var cCode = this.getView().getModel("CustomerData").getData().sap_company_code;
                    if (cCode === "")
                        cCode = "1000";
                    var cntryKey = "US";
                    
                    var url = "https://stripeservice.cfapps.us10.hana.ondemand.com/checkout.html?customerId=" + customerNum + "&" + "amount=" + custAmt + 
                        "&" + "cc=" + cCode;
                    oGlobalBusyDialog.open();
                    iframeVisible.addItem(new sap.ui.core.HTML({
                        preferDOM: true,
                        content: "<iframe frameborder='0' allowpaymentrequest='true' scrolling='yes' allowfullscreen='true' allowtransparency='true' src='" + url + "' style='width:100%;height:700px;overflow:hidden'></iframe>"
                    }));
                    oGlobalBusyDialog.close();
                // } else {
                //     alert("Please enter a valid amount.")
                // }
            },
            _getODataModel: function() {
                return this.getOwnerComponent().getModel();
            }
            
        });
    });

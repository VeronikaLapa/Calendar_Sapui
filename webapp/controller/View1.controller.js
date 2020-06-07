sap.ui.define([
	"sap/ui/core/mvc/Controller",
   "sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
	"use strict";

	return Controller.extend("ifmo.itmo_clendar_2020_lvv.controller.View1", {
		onInit: function () {
			var oData = {
            	"holiday": {
            		"list" : [
            			],
            		"duration": 0,
            		"working": 0,
            		"counted": 0
            	}
        	};
        	var oModel = new JSONModel(oData);
        	this.getView().setModel(oModel, "holiday");
        	//console.log(this.getView().getModel("holiday").getData());
    	}
	});
});
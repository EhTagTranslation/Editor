(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["main"],{

/***/ "./src/$$_lazy_route_resource lazy recursive":
/*!**********************************************************!*\
  !*** ./src/$$_lazy_route_resource lazy namespace object ***!
  \**********************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

function webpackEmptyAsyncContext(req) {
	// Here Promise.resolve().then() is used instead of new Promise() to prevent
	// uncaught exception popping up in devtools
	return Promise.resolve().then(function() {
		var e = new Error("Cannot find module '" + req + "'");
		e.code = 'MODULE_NOT_FOUND';
		throw e;
	});
}
webpackEmptyAsyncContext.keys = function() { return []; };
webpackEmptyAsyncContext.resolve = webpackEmptyAsyncContext;
module.exports = webpackEmptyAsyncContext;
webpackEmptyAsyncContext.id = "./src/$$_lazy_route_resource lazy recursive";

/***/ }),

/***/ "./src/app/app-routing.module.ts":
/*!***************************************!*\
  !*** ./src/app/app-routing.module.ts ***!
  \***************************************/
/*! exports provided: AppRoutingModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppRoutingModule", function() { return AppRoutingModule; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm5/router.js");
/* harmony import */ var _index_index_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./index/index.component */ "./src/app/index/index.component.ts");
/* harmony import */ var _list_list_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./list/list.component */ "./src/app/list/list.component.ts");
/* harmony import */ var _form_form_component__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./form/form.component */ "./src/app/form/form.component.ts");






var routes = [
    {
        path: '', component: _index_index_component__WEBPACK_IMPORTED_MODULE_3__["IndexComponent"], data: { title: '首页' },
        children: [
            { path: '', redirectTo: 'list/artist', pathMatch: 'full' },
            { path: 'list/:namespace', component: _list_list_component__WEBPACK_IMPORTED_MODULE_4__["ListComponent"], data: { title: '列表' } },
            { path: 'form/:namespace/:tag', component: _form_form_component__WEBPACK_IMPORTED_MODULE_5__["FormComponent"], data: { title: '编辑' } },
        ]
    },
];
var AppRoutingModule = /** @class */ (function () {
    function AppRoutingModule() {
    }
    AppRoutingModule = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["NgModule"])({
            imports: [_angular_router__WEBPACK_IMPORTED_MODULE_2__["RouterModule"].forRoot(routes, {
                    useHash: true
                })],
            exports: [_angular_router__WEBPACK_IMPORTED_MODULE_2__["RouterModule"]]
        })
    ], AppRoutingModule);
    return AppRoutingModule;
}());



/***/ }),

/***/ "./src/app/app.component.html":
/*!************************************!*\
  !*** ./src/app/app.component.html ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<router-outlet></router-outlet>"

/***/ }),

/***/ "./src/app/app.component.scss":
/*!************************************!*\
  !*** ./src/app/app.component.scss ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJzcmMvYXBwL2FwcC5jb21wb25lbnQuc2NzcyJ9 */"

/***/ }),

/***/ "./src/app/app.component.ts":
/*!**********************************!*\
  !*** ./src/app/app.component.ts ***!
  \**********************************/
/*! exports provided: AppComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppComponent", function() { return AppComponent; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");


var AppComponent = /** @class */ (function () {
    function AppComponent() {
        this.title = 'editor';
    }
    AppComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
            selector: 'app-root',
            template: __webpack_require__(/*! ./app.component.html */ "./src/app/app.component.html"),
            styles: [__webpack_require__(/*! ./app.component.scss */ "./src/app/app.component.scss")]
        })
    ], AppComponent);
    return AppComponent;
}());



/***/ }),

/***/ "./src/app/app.module.ts":
/*!*******************************!*\
  !*** ./src/app/app.module.ts ***!
  \*******************************/
/*! exports provided: AppModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppModule", function() { return AppModule; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_platform_browser__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/platform-browser */ "./node_modules/@angular/platform-browser/fesm5/platform-browser.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _app_routing_module__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app-routing.module */ "./src/app/app-routing.module.ts");
/* harmony import */ var _app_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./app.component */ "./src/app/app.component.ts");
/* harmony import */ var _angular_platform_browser_animations__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @angular/platform-browser/animations */ "./node_modules/@angular/platform-browser/fesm5/animations.js");
/* harmony import */ var _index_index_component__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./index/index.component */ "./src/app/index/index.component.ts");
/* harmony import */ var _angular_cdk_layout__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/cdk/layout */ "./node_modules/@angular/cdk/esm5/layout.es5.js");
/* harmony import */ var _angular_material__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/material */ "./node_modules/@angular/material/esm5/material.es5.js");
/* harmony import */ var _list_list_component__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./list/list.component */ "./src/app/list/list.component.ts");
/* harmony import */ var _form_form_component__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./form/form.component */ "./src/app/form/form.component.ts");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! @angular/forms */ "./node_modules/@angular/forms/fesm5/forms.js");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! @angular/common/http */ "./node_modules/@angular/common/fesm5/http.js");
/* harmony import */ var _shared_pipe_mark_pipe__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./shared/pipe/mark.pipe */ "./src/app/shared/pipe/mark.pipe.ts");
/* harmony import */ var src_service_eh_http_interceptor__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! src/service/eh-http-interceptor */ "./src/service/eh-http-interceptor.ts");















var AppModule = /** @class */ (function () {
    function AppModule() {
    }
    AppModule = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_2__["NgModule"])({
            declarations: [
                _app_component__WEBPACK_IMPORTED_MODULE_4__["AppComponent"],
                _index_index_component__WEBPACK_IMPORTED_MODULE_6__["IndexComponent"],
                _list_list_component__WEBPACK_IMPORTED_MODULE_9__["ListComponent"],
                _form_form_component__WEBPACK_IMPORTED_MODULE_10__["FormComponent"],
                _shared_pipe_mark_pipe__WEBPACK_IMPORTED_MODULE_13__["MarkPipe"]
            ],
            imports: [
                _angular_platform_browser__WEBPACK_IMPORTED_MODULE_1__["BrowserModule"],
                _app_routing_module__WEBPACK_IMPORTED_MODULE_3__["AppRoutingModule"],
                _angular_platform_browser_animations__WEBPACK_IMPORTED_MODULE_5__["BrowserAnimationsModule"],
                _angular_cdk_layout__WEBPACK_IMPORTED_MODULE_7__["LayoutModule"],
                _angular_common_http__WEBPACK_IMPORTED_MODULE_12__["HttpClientModule"],
                _angular_common_http__WEBPACK_IMPORTED_MODULE_12__["HttpClientJsonpModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_8__["MatToolbarModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_8__["MatButtonModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_8__["MatFormFieldModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_8__["MatInputModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_8__["MatSidenavModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_8__["MatIconModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_8__["MatListModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_8__["MatGridListModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_8__["MatCardModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_8__["MatMenuModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_8__["MatTableModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_8__["MatPaginatorModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_8__["MatSortModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_8__["MatSelectModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_8__["MatRadioModule"],
                _angular_forms__WEBPACK_IMPORTED_MODULE_11__["ReactiveFormsModule"],
                _angular_forms__WEBPACK_IMPORTED_MODULE_11__["FormsModule"],
            ],
            providers: [src_service_eh_http_interceptor__WEBPACK_IMPORTED_MODULE_14__["ehHttpInterceptorProvider"]],
            bootstrap: [_app_component__WEBPACK_IMPORTED_MODULE_4__["AppComponent"]]
        })
    ], AppModule);
    return AppModule;
}());



/***/ }),

/***/ "./src/app/form/form.component.css":
/*!*****************************************!*\
  !*** ./src/app/form/form.component.css ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = ".full-width {\r\n  width: 100%;\r\n}\r\n\r\n.shipping-card {\r\n  min-width: 120px;\r\n  margin: 20px auto;\r\n}\r\n\r\n.mat-radio-button {\r\n  display: block;\r\n  margin: 5px 0;\r\n}\r\n\r\n.row {\r\n  display: flex;\r\n  flex-direction: row;\r\n}\r\n\r\n.col {\r\n  flex: 1;\r\n  margin-right: 20px;\r\n}\r\n\r\n.col:last-child {\r\n  margin-right: 0;\r\n}\r\n\r\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9hcHAvZm9ybS9mb3JtLmNvbXBvbmVudC5jc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFDRSxXQUFXO0FBQ2I7O0FBRUE7RUFDRSxnQkFBZ0I7RUFDaEIsaUJBQWlCO0FBQ25COztBQUVBO0VBQ0UsY0FBYztFQUNkLGFBQWE7QUFDZjs7QUFFQTtFQUNFLGFBQWE7RUFDYixtQkFBbUI7QUFDckI7O0FBRUE7RUFDRSxPQUFPO0VBQ1Asa0JBQWtCO0FBQ3BCOztBQUVBO0VBQ0UsZUFBZTtBQUNqQiIsImZpbGUiOiJzcmMvYXBwL2Zvcm0vZm9ybS5jb21wb25lbnQuY3NzIiwic291cmNlc0NvbnRlbnQiOlsiLmZ1bGwtd2lkdGgge1xyXG4gIHdpZHRoOiAxMDAlO1xyXG59XHJcblxyXG4uc2hpcHBpbmctY2FyZCB7XHJcbiAgbWluLXdpZHRoOiAxMjBweDtcclxuICBtYXJnaW46IDIwcHggYXV0bztcclxufVxyXG5cclxuLm1hdC1yYWRpby1idXR0b24ge1xyXG4gIGRpc3BsYXk6IGJsb2NrO1xyXG4gIG1hcmdpbjogNXB4IDA7XHJcbn1cclxuXHJcbi5yb3cge1xyXG4gIGRpc3BsYXk6IGZsZXg7XHJcbiAgZmxleC1kaXJlY3Rpb246IHJvdztcclxufVxyXG5cclxuLmNvbCB7XHJcbiAgZmxleDogMTtcclxuICBtYXJnaW4tcmlnaHQ6IDIwcHg7XHJcbn1cclxuXHJcbi5jb2w6bGFzdC1jaGlsZCB7XHJcbiAgbWFyZ2luLXJpZ2h0OiAwO1xyXG59XHJcbiJdfQ== */"

/***/ }),

/***/ "./src/app/form/form.component.html":
/*!******************************************!*\
  !*** ./src/app/form/form.component.html ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<form [formGroup]=\"addressForm\" novalidate (ngSubmit)=\"onSubmit()\">\r\n  <mat-card class=\"shipping-card\">\r\n    <mat-card-header>\r\n      <mat-card-title>Shipping Information</mat-card-title>\r\n    </mat-card-header>\r\n    <mat-card-content>\r\n      <div class=\"row\">\r\n        <div class=\"col\">\r\n          <mat-form-field class=\"full-width\">\r\n            <input matInput placeholder=\"Company\" formControlName=\"company\">\r\n          </mat-form-field>\r\n        </div>\r\n      </div>\r\n      <div class=\"row\">\r\n        <div class=\"col\">\r\n          <mat-form-field class=\"full-width\">\r\n            <input matInput placeholder=\"First name\" formControlName=\"firstName\">\r\n            <mat-error *ngIf=\"addressForm.controls['firstName'].hasError('required')\">\r\n              First name is <strong>required</strong>\r\n            </mat-error>\r\n          </mat-form-field>\r\n        </div>\r\n        <div class=\"col\">\r\n          <mat-form-field class=\"full-width\">\r\n            <input matInput placeholder=\"Last name\" formControlName=\"lastName\">\r\n            <mat-error *ngIf=\"addressForm.controls['lastName'].hasError('required')\">\r\n              Last name is <strong>required</strong>\r\n            </mat-error>\r\n          </mat-form-field>\r\n        </div>\r\n      </div>\r\n      <div class=\"row\">\r\n        <div class=\"col\">\r\n          <mat-form-field class=\"full-width\">\r\n            <textarea matInput placeholder=\"Address\" formControlName=\"address\"></textarea>\r\n            <mat-error *ngIf=\"addressForm.controls['address'].hasError('required')\">\r\n              Address is <strong>required</strong>\r\n            </mat-error>\r\n          </mat-form-field>\r\n        </div>\r\n      </div>\r\n      <div class=\"row\" *ngIf=\"!hasUnitNumber\">\r\n        <div class=\"col\">\r\n          <button mat-button type=\"button\" (click)=\"hasUnitNumber = !hasUnitNumber\">\r\n            + Add C/O, Apt, Suite, Unit\r\n          </button>\r\n        </div>\r\n      </div>\r\n      <div class=\"row\" *ngIf=\"hasUnitNumber\">\r\n        <div class=\"col\">\r\n          <mat-form-field class=\"full-width\">\r\n            <textarea matInput placeholder=\"Address 2\" formControlName=\"address2\"></textarea>\r\n          </mat-form-field>\r\n        </div>\r\n      </div>\r\n      <div class=\"row\">\r\n        <div class=\"col\">\r\n          <mat-form-field class=\"full-width\">\r\n            <input matInput placeholder=\"City\" formControlName=\"city\">\r\n            <mat-error *ngIf=\"addressForm.controls['city'].hasError('required')\">\r\n              City is <strong>required</strong>\r\n            </mat-error>\r\n          </mat-form-field>\r\n        </div>\r\n        <div class=\"col\">\r\n          <mat-form-field class=\"full-width\">\r\n            <mat-select placeholder=\"State\" formControlName=\"state\">\r\n              <mat-option *ngFor=\"let state of states\" [value]=\"state.abbreviation\">\r\n                {{ state.name }}\r\n              </mat-option>\r\n            </mat-select>\r\n            <mat-error *ngIf=\"addressForm.controls['state'].hasError('required')\">\r\n              State is <strong>required</strong>\r\n            </mat-error>\r\n          </mat-form-field>\r\n        </div>\r\n      </div>\r\n      <div class=\"row\">\r\n        <div class=\"col\">\r\n          <mat-form-field class=\"full-width\">\r\n            <input matInput #postalCode maxlength=\"5\" placeholder=\"Postal Code\" type=\"number\" formControlName=\"postalCode\">\r\n            <mat-hint align=\"end\">{{postalCode.value.length}} / 5</mat-hint>\r\n          </mat-form-field>\r\n        </div>\r\n      </div>\r\n      <div class=\"row\">\r\n        <div class=\"col\">\r\n          <mat-radio-group formControlName=\"shipping\">\r\n            <mat-radio-button value=\"free\">Free Shipping</mat-radio-button>\r\n            <mat-radio-button value=\"priority\">Priority Shipping</mat-radio-button>\r\n            <mat-radio-button value=\"nextday\">Next Day Shipping</mat-radio-button>\r\n          </mat-radio-group>\r\n        </div>\r\n      </div>\r\n    </mat-card-content>\r\n    <mat-card-actions>\r\n      <button mat-raised-button color=\"primary\" type=\"submit\">Submit</button>\r\n    </mat-card-actions>\r\n  </mat-card>\r\n</form>\r\n"

/***/ }),

/***/ "./src/app/form/form.component.ts":
/*!****************************************!*\
  !*** ./src/app/form/form.component.ts ***!
  \****************************************/
/*! exports provided: FormComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "FormComponent", function() { return FormComponent; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/forms */ "./node_modules/@angular/forms/fesm5/forms.js");



var FormComponent = /** @class */ (function () {
    function FormComponent(fb) {
        this.fb = fb;
        this.addressForm = this.fb.group({
            company: null,
            firstName: [null, _angular_forms__WEBPACK_IMPORTED_MODULE_2__["Validators"].required],
            lastName: [null, _angular_forms__WEBPACK_IMPORTED_MODULE_2__["Validators"].required],
            address: [null, _angular_forms__WEBPACK_IMPORTED_MODULE_2__["Validators"].required],
            address2: null,
            city: [null, _angular_forms__WEBPACK_IMPORTED_MODULE_2__["Validators"].required],
            state: [null, _angular_forms__WEBPACK_IMPORTED_MODULE_2__["Validators"].required],
            postalCode: [null, _angular_forms__WEBPACK_IMPORTED_MODULE_2__["Validators"].compose([
                    _angular_forms__WEBPACK_IMPORTED_MODULE_2__["Validators"].required, _angular_forms__WEBPACK_IMPORTED_MODULE_2__["Validators"].minLength(5), _angular_forms__WEBPACK_IMPORTED_MODULE_2__["Validators"].maxLength(5)
                ])
            ],
            shipping: ['free', _angular_forms__WEBPACK_IMPORTED_MODULE_2__["Validators"].required]
        });
        this.hasUnitNumber = false;
        this.states = [
            { name: 'Alabama', abbreviation: 'AL' },
            { name: 'Alaska', abbreviation: 'AK' },
            { name: 'American Samoa', abbreviation: 'AS' },
            { name: 'Arizona', abbreviation: 'AZ' },
            { name: 'Arkansas', abbreviation: 'AR' },
            { name: 'California', abbreviation: 'CA' },
            { name: 'Colorado', abbreviation: 'CO' },
            { name: 'Connecticut', abbreviation: 'CT' },
            { name: 'Delaware', abbreviation: 'DE' },
            { name: 'District Of Columbia', abbreviation: 'DC' },
            { name: 'Federated States Of Micronesia', abbreviation: 'FM' },
            { name: 'Florida', abbreviation: 'FL' },
            { name: 'Georgia', abbreviation: 'GA' },
            { name: 'Guam', abbreviation: 'GU' },
            { name: 'Hawaii', abbreviation: 'HI' },
            { name: 'Idaho', abbreviation: 'ID' },
            { name: 'Illinois', abbreviation: 'IL' },
            { name: 'Indiana', abbreviation: 'IN' },
            { name: 'Iowa', abbreviation: 'IA' },
            { name: 'Kansas', abbreviation: 'KS' },
            { name: 'Kentucky', abbreviation: 'KY' },
            { name: 'Louisiana', abbreviation: 'LA' },
            { name: 'Maine', abbreviation: 'ME' },
            { name: 'Marshall Islands', abbreviation: 'MH' },
            { name: 'Maryland', abbreviation: 'MD' },
            { name: 'Massachusetts', abbreviation: 'MA' },
            { name: 'Michigan', abbreviation: 'MI' },
            { name: 'Minnesota', abbreviation: 'MN' },
            { name: 'Mississippi', abbreviation: 'MS' },
            { name: 'Missouri', abbreviation: 'MO' },
            { name: 'Montana', abbreviation: 'MT' },
            { name: 'Nebraska', abbreviation: 'NE' },
            { name: 'Nevada', abbreviation: 'NV' },
            { name: 'New Hampshire', abbreviation: 'NH' },
            { name: 'New Jersey', abbreviation: 'NJ' },
            { name: 'New Mexico', abbreviation: 'NM' },
            { name: 'New York', abbreviation: 'NY' },
            { name: 'North Carolina', abbreviation: 'NC' },
            { name: 'North Dakota', abbreviation: 'ND' },
            { name: 'Northern Mariana Islands', abbreviation: 'MP' },
            { name: 'Ohio', abbreviation: 'OH' },
            { name: 'Oklahoma', abbreviation: 'OK' },
            { name: 'Oregon', abbreviation: 'OR' },
            { name: 'Palau', abbreviation: 'PW' },
            { name: 'Pennsylvania', abbreviation: 'PA' },
            { name: 'Puerto Rico', abbreviation: 'PR' },
            { name: 'Rhode Island', abbreviation: 'RI' },
            { name: 'South Carolina', abbreviation: 'SC' },
            { name: 'South Dakota', abbreviation: 'SD' },
            { name: 'Tennessee', abbreviation: 'TN' },
            { name: 'Texas', abbreviation: 'TX' },
            { name: 'Utah', abbreviation: 'UT' },
            { name: 'Vermont', abbreviation: 'VT' },
            { name: 'Virgin Islands', abbreviation: 'VI' },
            { name: 'Virginia', abbreviation: 'VA' },
            { name: 'Washington', abbreviation: 'WA' },
            { name: 'West Virginia', abbreviation: 'WV' },
            { name: 'Wisconsin', abbreviation: 'WI' },
            { name: 'Wyoming', abbreviation: 'WY' }
        ];
    }
    FormComponent.prototype.onSubmit = function () {
        alert('Thanks!');
    };
    FormComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
            selector: 'app-form',
            template: __webpack_require__(/*! ./form.component.html */ "./src/app/form/form.component.html"),
            styles: [__webpack_require__(/*! ./form.component.css */ "./src/app/form/form.component.css")]
        }),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [_angular_forms__WEBPACK_IMPORTED_MODULE_2__["FormBuilder"]])
    ], FormComponent);
    return FormComponent;
}());



/***/ }),

/***/ "./src/app/index/index.component.css":
/*!*******************************************!*\
  !*** ./src/app/index/index.component.css ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = ".sidenav-container {\r\n  height: 100%;\r\n}\r\n\r\n.sidenav {\r\n  width: 200px;\r\n}\r\n\r\n.sidenav .mat-toolbar {\r\n  background: inherit;\r\n}\r\n\r\n.mat-toolbar.mat-primary {\r\n  position: -webkit-sticky;\r\n  position: sticky;\r\n  top: 0;\r\n  z-index: 1;\r\n}\r\n\r\n.page-box {\r\n  max-width: 800px;\r\n  margin: 24px auto;\r\n}\r\n\r\n.fill-remaining-space {\r\n  flex: 1 1 auto;\r\n}\r\n\r\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9hcHAvaW5kZXgvaW5kZXguY29tcG9uZW50LmNzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUNFLFlBQVk7QUFDZDs7QUFFQTtFQUNFLFlBQVk7QUFDZDs7QUFFQTtFQUNFLG1CQUFtQjtBQUNyQjs7QUFFQTtFQUNFLHdCQUFnQjtFQUFoQixnQkFBZ0I7RUFDaEIsTUFBTTtFQUNOLFVBQVU7QUFDWjs7QUFDQTtFQUNFLGdCQUFnQjtFQUNoQixpQkFBaUI7QUFDbkI7O0FBQ0E7RUFDRSxjQUFjO0FBQ2hCIiwiZmlsZSI6InNyYy9hcHAvaW5kZXgvaW5kZXguY29tcG9uZW50LmNzcyIsInNvdXJjZXNDb250ZW50IjpbIi5zaWRlbmF2LWNvbnRhaW5lciB7XHJcbiAgaGVpZ2h0OiAxMDAlO1xyXG59XHJcblxyXG4uc2lkZW5hdiB7XHJcbiAgd2lkdGg6IDIwMHB4O1xyXG59XHJcblxyXG4uc2lkZW5hdiAubWF0LXRvb2xiYXIge1xyXG4gIGJhY2tncm91bmQ6IGluaGVyaXQ7XHJcbn1cclxuXHJcbi5tYXQtdG9vbGJhci5tYXQtcHJpbWFyeSB7XHJcbiAgcG9zaXRpb246IHN0aWNreTtcclxuICB0b3A6IDA7XHJcbiAgei1pbmRleDogMTtcclxufVxyXG4ucGFnZS1ib3gge1xyXG4gIG1heC13aWR0aDogODAwcHg7XHJcbiAgbWFyZ2luOiAyNHB4IGF1dG87XHJcbn1cclxuLmZpbGwtcmVtYWluaW5nLXNwYWNlIHtcclxuICBmbGV4OiAxIDEgYXV0bztcclxufVxyXG4iXX0= */"

/***/ }),

/***/ "./src/app/index/index.component.html":
/*!********************************************!*\
  !*** ./src/app/index/index.component.html ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<router-outlet></router-outlet>\r\n"

/***/ }),

/***/ "./src/app/index/index.component.ts":
/*!******************************************!*\
  !*** ./src/app/index/index.component.ts ***!
  \******************************************/
/*! exports provided: IndexComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "IndexComponent", function() { return IndexComponent; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_cdk_layout__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/cdk/layout */ "./node_modules/@angular/cdk/esm5/layout.es5.js");
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rxjs/operators */ "./node_modules/rxjs/_esm5/operators/index.js");
/* harmony import */ var src_service_github_oauth_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! src/service/github-oauth.service */ "./src/service/github-oauth.service.ts");
/* harmony import */ var src_service_eh_tag_connector_service__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! src/service/eh-tag-connector.service */ "./src/service/eh-tag-connector.service.ts");






var IndexComponent = /** @class */ (function () {
    function IndexComponent(breakpointObserver, githubOauth, ehTagConnector) {
        var _this = this;
        this.breakpointObserver = breakpointObserver;
        this.githubOauth = githubOauth;
        this.ehTagConnector = ehTagConnector;
        this.isHandset$ = this.breakpointObserver.observe(_angular_cdk_layout__WEBPACK_IMPORTED_MODULE_2__["Breakpoints"].Handset)
            .pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_3__["map"])(function (result) { return result.matches; }));
        this.namespace = [
            { key: 'artist', name: '作者' },
            { key: 'character', name: '角色' },
            { key: 'group', name: '团队' },
            { key: 'language', name: '语言' },
            { key: 'female', name: '女性' },
            { key: 'male', name: '男性' },
            { key: 'parody', name: '原著' },
            { key: 'reclass', name: '重分类' },
        ];
        this.githubOauth.logInIfNeeded();
        this.githubOauth.getCurrentUser().then(function (e) { return console.log(e); });
        this.ehTagConnector.getTag({
            namespace: 'parody',
            raw: '	.hack',
        }).finally(function () {
            return _this.ehTagConnector.deleteTag({
                namespace: 'parody',
                raw: '	.ha1sdafck',
            });
        });
    }
    IndexComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
            selector: 'app-index',
            template: __webpack_require__(/*! ./index.component.html */ "./src/app/index/index.component.html"),
            styles: [__webpack_require__(/*! ./index.component.css */ "./src/app/index/index.component.css")]
        }),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [_angular_cdk_layout__WEBPACK_IMPORTED_MODULE_2__["BreakpointObserver"],
            src_service_github_oauth_service__WEBPACK_IMPORTED_MODULE_4__["GithubOauthService"],
            src_service_eh_tag_connector_service__WEBPACK_IMPORTED_MODULE_5__["EhTagConnectorService"]])
    ], IndexComponent);
    return IndexComponent;
}());



/***/ }),

/***/ "./src/app/list/list.component.css":
/*!*****************************************!*\
  !*** ./src/app/list/list.component.css ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = ".full-width-table {\r\n  width: 100%;\r\n}\r\n.sidenav-container {\r\n  height: 100%;\r\n}\r\n.sidenav {\r\n  width: 200px;\r\n}\r\n.sidenav .mat-toolbar {\r\n  background: inherit;\r\n}\r\n.mat-toolbar.mat-primary {\r\n  position: -webkit-sticky;\r\n  position: sticky;\r\n  top: 0;\r\n  z-index: 1;\r\n}\r\n.page-box {\r\n  max-width: 800px;\r\n  margin: 24px auto;\r\n}\r\n.fill-remaining-space {\r\n  flex: 1 1 auto;\r\n}\r\n\r\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9hcHAvbGlzdC9saXN0LmNvbXBvbmVudC5jc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFDRSxXQUFXO0FBQ2I7QUFDQTtFQUNFLFlBQVk7QUFDZDtBQUVBO0VBQ0UsWUFBWTtBQUNkO0FBRUE7RUFDRSxtQkFBbUI7QUFDckI7QUFFQTtFQUNFLHdCQUFnQjtFQUFoQixnQkFBZ0I7RUFDaEIsTUFBTTtFQUNOLFVBQVU7QUFDWjtBQUNBO0VBQ0UsZ0JBQWdCO0VBQ2hCLGlCQUFpQjtBQUNuQjtBQUNBO0VBQ0UsY0FBYztBQUNoQiIsImZpbGUiOiJzcmMvYXBwL2xpc3QvbGlzdC5jb21wb25lbnQuY3NzIiwic291cmNlc0NvbnRlbnQiOlsiLmZ1bGwtd2lkdGgtdGFibGUge1xyXG4gIHdpZHRoOiAxMDAlO1xyXG59XHJcbi5zaWRlbmF2LWNvbnRhaW5lciB7XHJcbiAgaGVpZ2h0OiAxMDAlO1xyXG59XHJcblxyXG4uc2lkZW5hdiB7XHJcbiAgd2lkdGg6IDIwMHB4O1xyXG59XHJcblxyXG4uc2lkZW5hdiAubWF0LXRvb2xiYXIge1xyXG4gIGJhY2tncm91bmQ6IGluaGVyaXQ7XHJcbn1cclxuXHJcbi5tYXQtdG9vbGJhci5tYXQtcHJpbWFyeSB7XHJcbiAgcG9zaXRpb246IHN0aWNreTtcclxuICB0b3A6IDA7XHJcbiAgei1pbmRleDogMTtcclxufVxyXG4ucGFnZS1ib3gge1xyXG4gIG1heC13aWR0aDogODAwcHg7XHJcbiAgbWFyZ2luOiAyNHB4IGF1dG87XHJcbn1cclxuLmZpbGwtcmVtYWluaW5nLXNwYWNlIHtcclxuICBmbGV4OiAxIDEgYXV0bztcclxufVxyXG4iXX0= */"

/***/ }),

/***/ "./src/app/list/list.component.html":
/*!******************************************!*\
  !*** ./src/app/list/list.component.html ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<mat-sidenav-container class=\"sidenav-container\">\r\n  <mat-sidenav-content>\r\n    <mat-toolbar color=\"primary\">\r\n      <span>列表</span>\r\n      <span class=\"fill-remaining-space\"></span>\r\n      <div style=\"padding-top: 8px\">\r\n        <mat-form-field  appearance=\"legacy\" floatLabel=\"never\">\r\n          <mat-label>搜索</mat-label>\r\n          <input [(ngModel)]=\"search\" (ngModelChange)=\"searchChange($event)\" matInput placeholder=\"Placeholder\">\r\n          <button matSuffix mat-icon-button><mat-icon matSuffix>search</mat-icon></button>\r\n        </mat-form-field>\r\n      </div>\r\n    </mat-toolbar>\r\n    <div class=\"page-box\">\r\n      <mat-menu #handleMenu=\"matMenu\">\r\n        <ng-template matMenuContent let-key=\"key\">\r\n          <button routerLink=\"/form/test/test\" mat-menu-item>\r\n            <mat-icon>edit</mat-icon>\r\n            <span>编辑</span>\r\n          </button>\r\n          <button mat-menu-item>\r\n            <mat-icon>delete</mat-icon>\r\n            <span>删除</span>\r\n          </button>\r\n        </ng-template>\r\n      </mat-menu>\r\n      <div *ngIf=\"loading\">Loading...</div>\r\n      <div class=\"mat-elevation-z8\">\r\n        <table mat-table class=\"full-width-table\" [dataSource]=\"dataSource\" matSort aria-label=\"Elements\">\r\n          <!-- Id Column -->\r\n          <ng-container matColumnDef=\"raw\">\r\n            <th mat-header-cell *matHeaderCellDef mat-sort-header>原始</th>\r\n            <td mat-cell *matCellDef=\"let row\"><span [innerHTML]=\"row.raw | mark: search\"></span></td>\r\n          </ng-container>\r\n\r\n          <ng-container matColumnDef=\"name\">\r\n            <th mat-header-cell *matHeaderCellDef mat-sort-header>名称</th>\r\n            <td mat-cell *matCellDef=\"let row\"><span [innerHTML]=\"row.name | mark: search\"></span></td>\r\n          </ng-container>\r\n\r\n          <ng-container matColumnDef=\"intro\">\r\n            <th mat-header-cell *matHeaderCellDef mat-sort-header>描述</th>\r\n            <td mat-cell *matCellDef=\"let row\"><span [innerHTML]=\"row.intro | mark: search\"></span></td>\r\n          </ng-container>\r\n\r\n          <ng-container matColumnDef=\"namespace\">\r\n            <th mat-header-cell *matHeaderCellDef mat-sort-header>命名空间</th>\r\n            <td mat-cell *matCellDef=\"let row\"><span [innerHTML]=\"row.namespace | mark: search\"></span></td>\r\n          </ng-container>\r\n\r\n          <ng-container matColumnDef=\"links\">\r\n            <th mat-header-cell *matHeaderCellDef mat-sort-header>连接</th>\r\n            <td mat-cell *matCellDef=\"let row\">{{row.links}}</td>\r\n          </ng-container>\r\n\r\n\r\n\r\n          <ng-container matColumnDef=\"handle\">\r\n            <th mat-header-cell *matHeaderCellDef mat-sort-header>操作</th>\r\n            <td mat-cell *matCellDef=\"let row\">\r\n              <button mat-icon-button\t [matMenuTriggerFor]=\"handleMenu\" [matMenuTriggerData]=\"{key: row.Raw}\" >\r\n                <mat-icon>more_vert</mat-icon>\r\n              </button>\r\n            </td>\r\n          </ng-container>\r\n\r\n\r\n          <tr mat-header-row *matHeaderRowDef=\"displayedColumns\"></tr>\r\n          <tr mat-row *matRowDef=\"let row; columns: displayedColumns;\"></tr>\r\n        </table>\r\n\r\n        <mat-paginator #paginator\r\n                       [length]=\"tags.length\"\r\n                       [pageIndex]=\"0\"\r\n                       [pageSize]=\"50\"\r\n                       [pageSizeOptions]=\"[25, 50, 100, 250]\">\r\n        </mat-paginator>\r\n      </div>\r\n    </div>\r\n  </mat-sidenav-content>\r\n</mat-sidenav-container>\r\n\r\n"

/***/ }),

/***/ "./src/app/list/list.component.ts":
/*!****************************************!*\
  !*** ./src/app/list/list.component.ts ***!
  \****************************************/
/*! exports provided: ListComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ListComponent", function() { return ListComponent; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_material__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/material */ "./node_modules/@angular/material/esm5/material.es5.js");
/* harmony import */ var _service_eh_tag_connector_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../service/eh-tag-connector.service */ "./src/service/eh-tag-connector.service.ts");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! rxjs */ "./node_modules/rxjs/_esm5/index.js");
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! rxjs/operators */ "./node_modules/rxjs/_esm5/operators/index.js");






var ListComponent = /** @class */ (function () {
    function ListComponent(ehTagConnector) {
        this.ehTagConnector = ehTagConnector;
        this.search = '';
        this.loading = false;
        this.displayedColumns = ['namespace', 'raw', 'name'];
        this.searchSubject = new rxjs__WEBPACK_IMPORTED_MODULE_4__["Subject"]();
        this.tags = [];
    }
    ListComponent.prototype.searchChange = function (text) {
        this.search = text;
        this.paginator.firstPage();
        this.searchSubject.next(text);
    };
    ListComponent.prototype.ngOnInit = function () {
        return tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"](this, void 0, void 0, function () {
            var _a, e_1;
            var _this = this;
            return tslib__WEBPACK_IMPORTED_MODULE_0__["__generator"](this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.loading = true;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        _a = this;
                        return [4 /*yield*/, this.ehTagConnector.getTags()];
                    case 2:
                        _a.tags = _b.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _b.sent();
                        console.error(e_1);
                        return [3 /*break*/, 4];
                    case 4:
                        this.dataSource = Object(rxjs__WEBPACK_IMPORTED_MODULE_4__["merge"])(Object(rxjs__WEBPACK_IMPORTED_MODULE_4__["of"])(this.tags), this.paginator.page, this.sort.sortChange, this.searchSubject).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_5__["map"])(function () { return _this.getPagedData(_this.getSortedData(_this.getSearchData(_this.tags.slice()))); }));
                        this.loading = false;
                        return [2 /*return*/];
                }
            });
        });
    };
    ListComponent.prototype.getPagedData = function (data) {
        var startIndex = this.paginator.pageIndex * this.paginator.pageSize;
        return data.splice(startIndex, this.paginator.pageSize);
    };
    ListComponent.prototype.getSortedData = function (data) {
        var _this = this;
        if (!this.sort.active || this.sort.direction === '') {
            return data;
        }
        return data.sort(function (a, b) {
            var isAsc = _this.sort.direction === 'asc';
            return compare(a[_this.sort.active], b[_this.sort.active], isAsc);
        });
    };
    ListComponent.prototype.getSearchData = function (data) {
        var _this = this;
        return data.filter(function (v) { return (v.name.indexOf(_this.search) !== -1 ||
            v.raw.indexOf(_this.search) !== -1); });
    };
    tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ViewChild"])(_angular_material__WEBPACK_IMPORTED_MODULE_2__["MatPaginator"]),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:type", _angular_material__WEBPACK_IMPORTED_MODULE_2__["MatPaginator"])
    ], ListComponent.prototype, "paginator", void 0);
    tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["ViewChild"])(_angular_material__WEBPACK_IMPORTED_MODULE_2__["MatSort"]),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:type", _angular_material__WEBPACK_IMPORTED_MODULE_2__["MatSort"])
    ], ListComponent.prototype, "sort", void 0);
    ListComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
            selector: 'app-list',
            template: __webpack_require__(/*! ./list.component.html */ "./src/app/list/list.component.html"),
            styles: [__webpack_require__(/*! ./list.component.css */ "./src/app/list/list.component.css")]
        }),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [_service_eh_tag_connector_service__WEBPACK_IMPORTED_MODULE_3__["EhTagConnectorService"]])
    ], ListComponent);
    return ListComponent;
}());

function compare(a, b, isAsc) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}


/***/ }),

/***/ "./src/app/shared/pipe/mark.pipe.ts":
/*!******************************************!*\
  !*** ./src/app/shared/pipe/mark.pipe.ts ***!
  \******************************************/
/*! exports provided: MarkPipe */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MarkPipe", function() { return MarkPipe; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");


var MarkPipe = /** @class */ (function () {
    function MarkPipe() {
    }
    MarkPipe.prototype.transform = function (value, arg) {
        if (!arg) {
            return value;
        }
        value = value.toString();
        var r = arg.replace(/([\*\.\(\[\\\?\+\|\{])/g, '\\$1');
        return value.replace(new RegExp('(' + r + ')', 'g'), '<mark>$1</mark>');
    };
    MarkPipe = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Pipe"])({
            name: 'mark',
            pure: true,
        })
    ], MarkPipe);
    return MarkPipe;
}());



/***/ }),

/***/ "./src/environments/environment.ts":
/*!*****************************************!*\
  !*** ./src/environments/environment.ts ***!
  \*****************************************/
/*! exports provided: environment */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "environment", function() { return environment; });
// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
var environment = {
    production: false
};
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.


/***/ }),

/***/ "./src/main.ts":
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var hammerjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! hammerjs */ "./node_modules/hammerjs/hammer.js");
/* harmony import */ var hammerjs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(hammerjs__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_platform_browser_dynamic__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/platform-browser-dynamic */ "./node_modules/@angular/platform-browser-dynamic/fesm5/platform-browser-dynamic.js");
/* harmony import */ var _app_app_module__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/app.module */ "./src/app/app.module.ts");
/* harmony import */ var _environments_environment__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./environments/environment */ "./src/environments/environment.ts");





if (_environments_environment__WEBPACK_IMPORTED_MODULE_4__["environment"].production) {
    Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["enableProdMode"])();
}
Object(_angular_platform_browser_dynamic__WEBPACK_IMPORTED_MODULE_2__["platformBrowserDynamic"])().bootstrapModule(_app_app_module__WEBPACK_IMPORTED_MODULE_3__["AppModule"])
    .catch(function (err) { return console.error(err); });


/***/ }),

/***/ "./src/service/api-endpoint.service.ts":
/*!*********************************************!*\
  !*** ./src/service/api-endpoint.service.ts ***!
  \*********************************************/
/*! exports provided: ApiEndpointService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ApiEndpointService", function() { return ApiEndpointService; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");


var ApiEndpointService = /** @class */ (function () {
    function ApiEndpointService() {
    }
    Object.defineProperty(ApiEndpointService.prototype, "github", {
        get: function () { return 'https://api.github.com/'; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ApiEndpointService.prototype, "ehTagConnector", {
        get: function () { return 'https://ehtagconnector.azurewebsites.net/api/database/'; },
        enumerable: true,
        configurable: true
    });
    ApiEndpointService = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Injectable"])({
            providedIn: 'root'
        })
    ], ApiEndpointService);
    return ApiEndpointService;
}());



/***/ }),

/***/ "./src/service/eh-http-interceptor.ts":
/*!********************************************!*\
  !*** ./src/service/eh-http-interceptor.ts ***!
  \********************************************/
/*! exports provided: EhHttpInterceptor, ehHttpInterceptorProvider */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "EhHttpInterceptor", function() { return EhHttpInterceptor; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ehHttpInterceptorProvider", function() { return ehHttpInterceptorProvider; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! rxjs/operators */ "./node_modules/rxjs/_esm5/operators/index.js");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/common/http */ "./node_modules/@angular/common/fesm5/http.js");
/* harmony import */ var _github_oauth_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./github-oauth.service */ "./src/service/github-oauth.service.ts");
/* harmony import */ var _eh_tag_connector_service__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./eh-tag-connector.service */ "./src/service/eh-tag-connector.service.ts");
/* harmony import */ var _api_endpoint_service__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./api-endpoint.service */ "./src/service/api-endpoint.service.ts");







var EhHttpInterceptor = /** @class */ (function () {
    function EhHttpInterceptor(githubOauth, ehTagConnector, endpoints) {
        this.githubOauth = githubOauth;
        this.ehTagConnector = ehTagConnector;
        this.endpoints = endpoints;
    }
    EhHttpInterceptor.prototype.intercept = function (req, next) {
        var _this = this;
        var authReq = req;
        var token = this.githubOauth.token;
        if (req.url.startsWith(this.endpoints.github) && token) {
            /**
             * use `access_token` for more rate limits
             * @see https://developer.github.com/v3/#rate-limiting
             */
            authReq = req.clone({
                setParams: { access_token: token }
            });
        }
        if (req.url.startsWith(this.endpoints.ehTagConnector)) {
            var mod = {
                setHeaders: {}
            };
            if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
                if (token) {
                    mod.setHeaders['X-Token'] = token;
                }
                if (this.ehTagConnector.hash) {
                    mod.setHeaders['If-Match'] = "\"" + this.ehTagConnector.hash + "\"";
                }
            }
            authReq = req.clone(mod);
        }
        console.log('req', authReq);
        return next.handle(authReq).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["tap"])(function (v) {
            if (v.type === _angular_common_http__WEBPACK_IMPORTED_MODULE_3__["HttpEventType"].Response && req.url.startsWith(_this.endpoints.ehTagConnector)) {
                // `W/` might be added by some CDN
                var etag = (v.headers.get('etag').match(/^(W\/)?"(\w+)"$/) || [])[2];
                if (etag) {
                    console.log('etag', etag);
                    _this.ehTagConnector.hash = etag;
                }
            }
            console.log('tap', v);
        }));
    };
    EhHttpInterceptor = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Injectable"])(),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [_github_oauth_service__WEBPACK_IMPORTED_MODULE_4__["GithubOauthService"],
            _eh_tag_connector_service__WEBPACK_IMPORTED_MODULE_5__["EhTagConnectorService"],
            _api_endpoint_service__WEBPACK_IMPORTED_MODULE_6__["ApiEndpointService"]])
    ], EhHttpInterceptor);
    return EhHttpInterceptor;
}());

var ehHttpInterceptorProvider = { provide: _angular_common_http__WEBPACK_IMPORTED_MODULE_3__["HTTP_INTERCEPTORS"], useClass: EhHttpInterceptor, multi: true };


/***/ }),

/***/ "./src/service/eh-tag-connector.service.ts":
/*!*************************************************!*\
  !*** ./src/service/eh-tag-connector.service.ts ***!
  \*************************************************/
/*! exports provided: EhTagConnectorService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "EhTagConnectorService", function() { return EhTagConnectorService; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common/http */ "./node_modules/@angular/common/fesm5/http.js");
/* harmony import */ var _api_endpoint_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./api-endpoint.service */ "./src/service/api-endpoint.service.ts");




var EhTagConnectorService = /** @class */ (function () {
    // https://ehtagconnector.azurewebsites.net/api/database
    function EhTagConnectorService(http, endpoints) {
        this.http = http;
        this.endpoints = endpoints;
        this.tags = [];
        this.hash = window.localStorage.getItem('EhTagHash');
        //
        // this.hash = from(window.localStorage.getItem('EhTagHash'))
        //   .pipe(
        //     filter(v => !!v),
        //     switchTap(() =>
        //       fromEvent(window, 'storage').pipe(
        //         map(v => {
        //           console.log(v);
        //           return v;
        //         })
        //       )
        //     )
        //   ).subscribe(e => {
        //
        //   });
        // this.hash = this.hashChange.pipe(filter(v => !!v));
        // this.hashChange.next();
    }
    EhTagConnectorService.prototype.getEndpoint = function (item) {
        return "" + this.endpoints.ehTagConnector + item.namespace + "/" + item.raw.trim().toLowerCase() + "?format=raw.json";
    };
    EhTagConnectorService.prototype.getTag = function (item) {
        return tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"](this, void 0, void 0, function () {
            var endpoint;
            return tslib__WEBPACK_IMPORTED_MODULE_0__["__generator"](this, function (_a) {
                switch (_a.label) {
                    case 0:
                        endpoint = this.getEndpoint(item);
                        return [4 /*yield*/, this.http.get(endpoint).toPromise()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    EhTagConnectorService.prototype.addTag = function (item) {
        return tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"](this, void 0, void 0, function () {
            var endpoint, payload;
            return tslib__WEBPACK_IMPORTED_MODULE_0__["__generator"](this, function (_a) {
                switch (_a.label) {
                    case 0:
                        endpoint = this.getEndpoint(item);
                        payload = {
                            intro: item.intro,
                            name: item.name,
                            links: item.links,
                        };
                        return [4 /*yield*/, this.http.post(endpoint, payload).toPromise()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    EhTagConnectorService.prototype.modifyTag = function (item) {
        return tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"](this, void 0, void 0, function () {
            var endpoint, payload;
            return tslib__WEBPACK_IMPORTED_MODULE_0__["__generator"](this, function (_a) {
                switch (_a.label) {
                    case 0:
                        endpoint = this.getEndpoint(item);
                        payload = {
                            intro: item.intro,
                            name: item.name,
                            links: item.links,
                        };
                        return [4 /*yield*/, this.http.put(endpoint, payload).toPromise()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    EhTagConnectorService.prototype.deleteTag = function (item) {
        return tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"](this, void 0, void 0, function () {
            var endpoint;
            return tslib__WEBPACK_IMPORTED_MODULE_0__["__generator"](this, function (_a) {
                switch (_a.label) {
                    case 0:
                        endpoint = this.getEndpoint(item);
                        return [4 /*yield*/, this.http.delete(endpoint).toPromise()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    EhTagConnectorService.prototype.getTags = function () {
        return tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"](this, void 0, void 0, function () {
            var info, asset, promise, script, data, e_1;
            var _this = this;
            return tslib__WEBPACK_IMPORTED_MODULE_0__["__generator"](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.http.get(this.endpoints.github + 'repos/ehtagtranslation/Database/releases/latest').toPromise()];
                    case 1:
                        info = _a.sent();
                        console.log('info', info);
                        asset = info.assets.find(function (i) { return i.name === 'db.raw.js'; });
                        promise = new Promise(function (resolve, reject) {
                            var close = function () {
                                clearTimeout(timeoutGuard);
                                window.load_ehtagtranslation_database = null;
                            };
                            var timeoutGuard = setTimeout(function () {
                                reject(new Error('Get EhTag Timeout'));
                                close();
                            }, 30 * 1000);
                            window.load_ehtagtranslation_database = function (data) {
                                resolve(data);
                                close();
                            };
                        });
                        script = document.createElement('script');
                        script.setAttribute('src', asset.browser_download_url);
                        document.getElementsByTagName('head')[0].appendChild(script);
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, promise];
                    case 3:
                        data = _a.sent();
                        this.hash = data.head.sha;
                        this.tags = [];
                        data.data.forEach(function (namespace) {
                            for (var raw in namespace.data) {
                                if (namespace.data.hasOwnProperty(raw)) {
                                    var element = namespace.data[raw];
                                    _this.tags.push(tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"]({}, element, { raw: raw, namespace: namespace.namespace }));
                                }
                            }
                        });
                        return [2 /*return*/, this.tags];
                    case 4:
                        e_1 = _a.sent();
                        console.error(e_1);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    EhTagConnectorService = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Injectable"])({
            providedIn: 'root'
        }),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [_angular_common_http__WEBPACK_IMPORTED_MODULE_2__["HttpClient"],
            _api_endpoint_service__WEBPACK_IMPORTED_MODULE_3__["ApiEndpointService"]])
    ], EhTagConnectorService);
    return EhTagConnectorService;
}());



/***/ }),

/***/ "./src/service/github-oauth.service.ts":
/*!*********************************************!*\
  !*** ./src/service/github-oauth.service.ts ***!
  \*********************************************/
/*! exports provided: GithubOauthService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "GithubOauthService", function() { return GithubOauthService; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common/http */ "./node_modules/@angular/common/fesm5/http.js");
/* harmony import */ var _api_endpoint_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./api-endpoint.service */ "./src/service/api-endpoint.service.ts");




var clientId = '2f2070671bda676ddb5a';
var windowName = 'githubOauth';
var localStorageKey = 'github_oauth_token';
var GithubOauthService = /** @class */ (function () {
    function GithubOauthService(httpClient, endpoints) {
        this.httpClient = httpClient;
        this.endpoints = endpoints;
        // make sure `token` is valid
        this.setToken(this.token);
    }
    Object.defineProperty(GithubOauthService.prototype, "token", {
        get: function () {
            return localStorage.getItem(localStorageKey);
        },
        enumerable: true,
        configurable: true
    });
    GithubOauthService.prototype.setToken = function (value) {
        if (!value || !value.match(/^\w+$/)) {
            localStorage.removeItem(localStorageKey);
        }
        else {
            localStorage.setItem(localStorageKey, value);
        }
    };
    /**
     * @see https://developer.github.com/v3/users/#get-the-authenticated-user
     */
    GithubOauthService.prototype.getCurrentUser = function () {
        return tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"](this, void 0, void 0, function () {
            var token, ex_1;
            return tslib__WEBPACK_IMPORTED_MODULE_0__["__generator"](this, function (_a) {
                switch (_a.label) {
                    case 0:
                        token = this.token;
                        if (!token) {
                            throw new Error('Need log in.');
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.httpClient.get(this.endpoints.github + 'user').toPromise()];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        ex_1 = _a.sent();
                        if (ex_1.status === 401 && this.token === token) {
                            // token is invalid.
                            this.setToken();
                        }
                        throw ex_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @returns `true` for succeed login, `false` if has been logged in.
     */
    GithubOauthService.prototype.logInIfNeeded = function () {
        var _this = this;
        if (this.token) {
            return Promise.resolve(false);
        }
        var callback = location.origin + location.pathname + 'assets/callback.html';
        var authWindow = window.open("https://github.com/login/oauth/authorize?client_id=" + clientId + "&scope=&redirect_uri=" + callback, windowName, 'toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=no,width=640,height=720');
        return new Promise(function (resolve, reject) {
            var onMessage = function (ev) { return tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"](_this, void 0, void 0, function () {
                var data;
                return tslib__WEBPACK_IMPORTED_MODULE_0__["__generator"](this, function (_a) {
                    if (ev.source !== authWindow) {
                        return [2 /*return*/];
                    }
                    data = ev.data;
                    if (data.error) {
                        reject(data.error);
                    }
                    else {
                        this.setToken(data.token);
                        resolve(true);
                    }
                    window.removeEventListener('message', onMessage);
                    return [2 /*return*/];
                });
            }); };
            window.addEventListener('message', onMessage);
        });
    };
    GithubOauthService.prototype.logOut = function () {
        this.setToken();
    };
    Object.defineProperty(GithubOauthService.prototype, "reviewUrl", {
        /**
         * Directing users to review their access
         * @see https://developer.github.com/apps/building-oauth-apps/authorizing-oauth-apps/#directing-users-to-review-their-access
         */
        get: function () { return "https://github.com/settings/connections/applications/" + clientId; },
        enumerable: true,
        configurable: true
    });
    GithubOauthService = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Injectable"])({
            providedIn: 'root'
        }),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [_angular_common_http__WEBPACK_IMPORTED_MODULE_2__["HttpClient"],
            _api_endpoint_service__WEBPACK_IMPORTED_MODULE_3__["ApiEndpointService"]])
    ], GithubOauthService);
    return GithubOauthService;
}());



/***/ }),

/***/ 0:
/*!***************************!*\
  !*** multi ./src/main.ts ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! C:\Users\lzy\Documents\Source\EhTagTranslation\Editor\src\main.ts */"./src/main.ts");


/***/ })

},[[0,"runtime","vendor"]]]);
//# sourceMappingURL=main.js.map
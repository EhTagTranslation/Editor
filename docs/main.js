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

/***/ "./src/app/about/about.component.html":
/*!********************************************!*\
  !*** ./src/app/about/about.component.html ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<p>\n  about works!\n</p>\n"

/***/ }),

/***/ "./src/app/about/about.component.sass":
/*!********************************************!*\
  !*** ./src/app/about/about.component.sass ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJzcmMvYXBwL2Fib3V0L2Fib3V0LmNvbXBvbmVudC5zYXNzIn0= */"

/***/ }),

/***/ "./src/app/about/about.component.ts":
/*!******************************************!*\
  !*** ./src/app/about/about.component.ts ***!
  \******************************************/
/*! exports provided: AboutComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AboutComponent", function() { return AboutComponent; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");


var AboutComponent = /** @class */ (function () {
    function AboutComponent() {
    }
    AboutComponent.prototype.ngOnInit = function () {
    };
    AboutComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
            selector: 'app-about',
            template: __webpack_require__(/*! ./about.component.html */ "./src/app/about/about.component.html"),
            styles: [__webpack_require__(/*! ./about.component.sass */ "./src/app/about/about.component.sass")]
        }),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [])
    ], AboutComponent);
    return AboutComponent;
}());



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
/* harmony import */ var _list_list_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./list/list.component */ "./src/app/list/list.component.ts");
/* harmony import */ var _editor_editor_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./editor/editor.component */ "./src/app/editor/editor.component.ts");
/* harmony import */ var _about_about_component__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./about/about.component */ "./src/app/about/about.component.ts");






var routes = [
    {
        path: 'edit/:ns/:raw',
        component: _editor_editor_component__WEBPACK_IMPORTED_MODULE_4__["EditorComponent"],
    },
    {
        path: 'list',
        component: _list_list_component__WEBPACK_IMPORTED_MODULE_3__["ListComponent"],
        children: [
            {
                path: ':ns',
                component: _list_list_component__WEBPACK_IMPORTED_MODULE_3__["ListComponent"],
            }
        ]
    },
    {
        path: 'about',
        component: _about_about_component__WEBPACK_IMPORTED_MODULE_5__["AboutComponent"],
    },
    {
        path: '**',
        redirectTo: '/list',
    },
];
var AppRoutingModule = /** @class */ (function () {
    function AppRoutingModule() {
    }
    AppRoutingModule = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["NgModule"])({
            imports: [_angular_router__WEBPACK_IMPORTED_MODULE_2__["RouterModule"].forRoot(routes)],
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

module.exports = "<mat-toolbar color=\"accent\" role=\"heading\" class=\"mat-elevation-z8\">\n  <span>{{title}}</span>\n  <span style=\"flex: 1 1 auto;\"></span>\n  <app-user></app-user>\n</mat-toolbar>\n\n<router-outlet></router-outlet>"

/***/ }),

/***/ "./src/app/app.component.sass":
/*!************************************!*\
  !*** ./src/app/app.component.sass ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJzcmMvYXBwL2FwcC5jb21wb25lbnQuc2FzcyJ9 */"

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
        this.title = 'EhTag Editor';
    }
    AppComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
            selector: 'app-root',
            template: __webpack_require__(/*! ./app.component.html */ "./src/app/app.component.html"),
            styles: [__webpack_require__(/*! ./app.component.sass */ "./src/app/app.component.sass")]
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
/* harmony import */ var src_services_eh_http_interceptor__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! src/services/eh-http-interceptor */ "./src/services/eh-http-interceptor.ts");
/* harmony import */ var _user_user_component__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./user/user.component */ "./src/app/user/user.component.ts");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/common/http */ "./node_modules/@angular/common/fesm5/http.js");
/* harmony import */ var _angular_platform_browser_animations__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @angular/platform-browser/animations */ "./node_modules/@angular/platform-browser/fesm5/animations.js");
/* harmony import */ var _angular_material__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @angular/material */ "./node_modules/@angular/material/esm5/material.es5.js");
/* harmony import */ var _angular_material_toolbar__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @angular/material/toolbar */ "./node_modules/@angular/material/esm5/toolbar.es5.js");
/* harmony import */ var _list_list_component__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./list/list.component */ "./src/app/list/list.component.ts");
/* harmony import */ var _editor_editor_component__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./editor/editor.component */ "./src/app/editor/editor.component.ts");
/* harmony import */ var _about_about_component__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./about/about.component */ "./src/app/about/about.component.ts");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! @angular/forms */ "./node_modules/@angular/forms/fesm5/forms.js");
/* harmony import */ var _shared_pipe_mark_pipe__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./shared/pipe/mark.pipe */ "./src/app/shared/pipe/mark.pipe.ts");
















var AppModule = /** @class */ (function () {
    function AppModule() {
    }
    AppModule = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_2__["NgModule"])({
            declarations: [
                _app_component__WEBPACK_IMPORTED_MODULE_4__["AppComponent"],
                _user_user_component__WEBPACK_IMPORTED_MODULE_6__["UserComponent"],
                _list_list_component__WEBPACK_IMPORTED_MODULE_11__["ListComponent"],
                _editor_editor_component__WEBPACK_IMPORTED_MODULE_12__["EditorComponent"],
                _about_about_component__WEBPACK_IMPORTED_MODULE_13__["AboutComponent"],
                _shared_pipe_mark_pipe__WEBPACK_IMPORTED_MODULE_15__["MarkPipe"],
            ],
            imports: [
                _angular_platform_browser__WEBPACK_IMPORTED_MODULE_1__["BrowserModule"],
                _app_routing_module__WEBPACK_IMPORTED_MODULE_3__["AppRoutingModule"],
                _angular_common_http__WEBPACK_IMPORTED_MODULE_7__["HttpClientModule"],
                _angular_platform_browser_animations__WEBPACK_IMPORTED_MODULE_8__["BrowserAnimationsModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_9__["MatButtonModule"],
                _angular_material_toolbar__WEBPACK_IMPORTED_MODULE_10__["MatToolbarModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_9__["MatMenuModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_9__["MatTableModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_9__["MatIconModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_9__["MatInputModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_9__["MatPaginatorModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_9__["MatFormFieldModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_9__["MatSortModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_9__["MatProgressSpinnerModule"],
                _angular_material__WEBPACK_IMPORTED_MODULE_9__["MatTooltipModule"],
                _angular_forms__WEBPACK_IMPORTED_MODULE_14__["FormsModule"],
            ],
            providers: [src_services_eh_http_interceptor__WEBPACK_IMPORTED_MODULE_5__["ehHttpInterceptorProvider"]],
            bootstrap: [_app_component__WEBPACK_IMPORTED_MODULE_4__["AppComponent"]]
        })
    ], AppModule);
    return AppModule;
}());



/***/ }),

/***/ "./src/app/editor/editor.component.html":
/*!**********************************************!*\
  !*** ./src/app/editor/editor.component.html ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<p>\n  editor works!\n</p>\n"

/***/ }),

/***/ "./src/app/editor/editor.component.sass":
/*!**********************************************!*\
  !*** ./src/app/editor/editor.component.sass ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJzcmMvYXBwL2VkaXRvci9lZGl0b3IuY29tcG9uZW50LnNhc3MifQ== */"

/***/ }),

/***/ "./src/app/editor/editor.component.ts":
/*!********************************************!*\
  !*** ./src/app/editor/editor.component.ts ***!
  \********************************************/
/*! exports provided: EditorComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "EditorComponent", function() { return EditorComponent; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");


var EditorComponent = /** @class */ (function () {
    function EditorComponent() {
    }
    EditorComponent.prototype.ngOnInit = function () {
    };
    EditorComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
            selector: 'app-editor',
            template: __webpack_require__(/*! ./editor.component.html */ "./src/app/editor/editor.component.html"),
            styles: [__webpack_require__(/*! ./editor.component.sass */ "./src/app/editor/editor.component.sass")]
        }),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [])
    ], EditorComponent);
    return EditorComponent;
}());



/***/ }),

/***/ "./src/app/list/list.component.html":
/*!******************************************!*\
  !*** ./src/app/list/list.component.html ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<div class=\"page-box\">\n  <div class=\"mat-elevation-z8\">\n    <header>\n      <mat-form-field appearance=\"legacy\" floatLabel=\"never\">\n        <mat-label>搜索</mat-label>\n        <input [(ngModel)]=\"search\" (ngModelChange)=\"searchChange($event)\" matInput placeholder=\"Placeholder\">\n        <button matSuffix mat-icon-button>\n          <mat-icon matSuffix>search</mat-icon>\n        </button>\n      </mat-form-field>\n      <span style=\"flex: 1 1 auto;\"></span>\n      <mat-paginator #paginator [length]=\"tags.length\" [pageIndex]=\"0\" [pageSize]=\"50\"\n        [pageSizeOptions]=\"[25, 50, 100, 250]\">\n      </mat-paginator>\n    </header>\n    <table mat-table [dataSource]=\"dataSource\" matSort aria-label=\"Elements\">\n      <!-- Id Column -->\n      <ng-container matColumnDef=\"raw\">\n        <th mat-header-cell *matHeaderCellDef mat-sort-header>原始</th>\n        <td mat-cell *matCellDef=\"let row\"><div [innerHTML]=\"row.raw | mark: search\"></div></td>\n      </ng-container>\n\n      <ng-container matColumnDef=\"name\">\n        <th mat-header-cell *matHeaderCellDef mat-sort-header>名称</th>\n        <td mat-cell *matCellDef=\"let row\"><div [innerHTML]=\"row.name | mark: search\"></div></td>\n      </ng-container>\n\n      <ng-container matColumnDef=\"intro\">\n        <th mat-header-cell *matHeaderCellDef mat-sort-header>描述</th>\n        <td mat-cell *matCellDef=\"let row\"><div [innerHTML]=\"row.intro | mark: search\"></div></td>\n      </ng-container>\n\n      <ng-container matColumnDef=\"namespace\">\n        <th mat-header-cell *matHeaderCellDef mat-sort-header style=\"width:80px;\">命名空间</th>\n        <td mat-cell *matCellDef=\"let row\"><div [innerHTML]=\"row.namespace\"></div></td>\n      </ng-container>\n\n      <ng-container matColumnDef=\"links\">\n        <th mat-header-cell *matHeaderCellDef mat-sort-header>链接</th>\n        <td mat-cell *matCellDef=\"let row\"><div [innerHTML]=\"row.namespace\"></div></td>\n      </ng-container>\n\n      <ng-container matColumnDef=\"handle\">\n        <th mat-header-cell *matHeaderCellDef style=\"width:40px;\"></th>\n        <td mat-cell *matCellDef=\"let row\">\n          <button mat-icon-button [matMenuTriggerFor]=\"handleMenu\" [matMenuTriggerData]=\"{key: row}\">\n            <mat-icon>more_vert</mat-icon>\n          </button>\n        </td>\n      </ng-container>\n\n\n      <tr mat-header-row *matHeaderRowDef=\"displayedColumns\"></tr>\n      <tr mat-row *matRowDef=\"let row; columns: displayedColumns;\"></tr>\n    </table>\n    <div class=\"spinner\" *ngIf=\"loading\">\n      <mat-spinner></mat-spinner>\n    </div>\n  </div>\n</div>\n\n<mat-menu #handleMenu=\"matMenu\" xPosition=\"before\">\n  <ng-template matMenuContent let-key=\"key\">\n    <button routerLink=\"/edit/{{key.namespace}}/{{key.raw}}\" mat-menu-item>\n      <mat-icon>edit</mat-icon>\n      <span>编辑</span>\n    </button>\n    <button mat-menu-item>\n      <mat-icon>delete</mat-icon>\n      <span>删除</span>\n    </button>\n  </ng-template>\n</mat-menu>"

/***/ }),

/***/ "./src/app/list/list.component.sass":
/*!******************************************!*\
  !*** ./src/app/list/list.component.sass ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = ".page-box {\n  max-width: 90%;\n  margin: 40px auto; }\n\ntable {\n  width: 100%; }\n\ntable .mat-cell > div {\n    padding: 4px 8px 4px 0; }\n\ndiv.spinner {\n  padding: 120px; }\n\ndiv.spinner mat-spinner {\n    margin: auto; }\n\n.mat-toolbar {\n  background: white; }\n\nheader {\n  display: flex;\n  padding: 0 24px; }\n\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9hcHAvbGlzdC9DOlxcVXNlcnNcXGx6eVxcRG9jdW1lbnRzXFxTb3VyY2VcXEVoVGFnVHJhbnNsYXRpb25cXEVkaXRvci9zcmNcXGFwcFxcbGlzdFxcbGlzdC5jb21wb25lbnQuc2FzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUNFLGNBQWM7RUFDZCxpQkFBaUIsRUFBQTs7QUFDbkI7RUFDRSxXQUFXLEVBQUE7O0FBRGI7SUFHSSxzQkFBc0IsRUFBQTs7QUFDMUI7RUFDRSxjQUFjLEVBQUE7O0FBRGhCO0lBR0ksWUFBWSxFQUFBOztBQUNoQjtFQUNFLGlCQUFpQixFQUFBOztBQUNuQjtFQUNFLGFBQWE7RUFDYixlQUFlLEVBQUEiLCJmaWxlIjoic3JjL2FwcC9saXN0L2xpc3QuY29tcG9uZW50LnNhc3MiLCJzb3VyY2VzQ29udGVudCI6WyIucGFnZS1ib3gge1xuICBtYXgtd2lkdGg6IDkwJTtcbiAgbWFyZ2luOiA0MHB4IGF1dG87IH1cbnRhYmxlIHtcbiAgd2lkdGg6IDEwMCU7XG4gIC5tYXQtY2VsbCA+IGRpdiB7XG4gICAgcGFkZGluZzogNHB4IDhweCA0cHggMDsgfSB9XG5kaXYuc3Bpbm5lciB7XG4gIHBhZGRpbmc6IDEyMHB4O1xuICBtYXQtc3Bpbm5lciB7XG4gICAgbWFyZ2luOiBhdXRvOyB9IH1cbi5tYXQtdG9vbGJhciB7XG4gIGJhY2tncm91bmQ6IHdoaXRlOyB9XG5oZWFkZXIge1xuICBkaXNwbGF5OiBmbGV4O1xuICBwYWRkaW5nOiAwIDI0cHg7IH1cbiJdfQ== */"

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
/* harmony import */ var _services_eh_tag_connector_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../services/eh-tag-connector.service */ "./src/services/eh-tag-connector.service.ts");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! rxjs */ "./node_modules/rxjs/_esm5/index.js");
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! rxjs/operators */ "./node_modules/rxjs/_esm5/operators/index.js");






var ListComponent = /** @class */ (function () {
    function ListComponent(ehTagConnector) {
        this.ehTagConnector = ehTagConnector;
        this.search = '';
        this.loading = false;
        this.displayedColumns = ['namespace', 'raw', 'name', 'intro', 'handle'];
        this.searchSubject = new rxjs__WEBPACK_IMPORTED_MODULE_4__["Subject"]();
        this.tags = [];
    }
    ListComponent.prototype.searchChange = function (text) {
        console.log(text);
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
            v.intro.indexOf(_this.search) !== -1 ||
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
            styles: [__webpack_require__(/*! ./list.component.sass */ "./src/app/list/list.component.sass")]
        }),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [_services_eh_tag_connector_service__WEBPACK_IMPORTED_MODULE_3__["EhTagConnectorService"]])
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

/***/ "./src/app/user/user.component.html":
/*!******************************************!*\
  !*** ./src/app/user/user.component.html ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<button mat-button *ngIf=\"user\" [matMenuTriggerFor]=\"userMenu\">\n  <img [src]=\"user?.avatar_url\" />\n  <span>{{user?.name}}</span>\n</button>\n<ng-template #elseBlock>\n  <button mat-button (click)=\"logIn()\">登录</button>\n</ng-template>\n\n\n<mat-menu #userMenu=\"matMenu\" xPosition=\"before\">\n  <ng-template matMenuContent>\n    <button mat-menu-item (click)=\"reviewSettings()\">\n      <mat-icon>settings</mat-icon>\n      <span>管理链接</span>\n    </button>\n    <button mat-menu-item (click)=\"logOut()\">\n      <mat-icon>power_settings_new</mat-icon>\n      <span>退出登录</span>\n    </button>\n  </ng-template>\n</mat-menu>"

/***/ }),

/***/ "./src/app/user/user.component.sass":
/*!******************************************!*\
  !*** ./src/app/user/user.component.sass ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "img {\n  height: 32px;\n  margin: 0 8px 0 0;\n  border-radius: 5%; }\n\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9hcHAvdXNlci9DOlxcVXNlcnNcXGx6eVxcRG9jdW1lbnRzXFxTb3VyY2VcXEVoVGFnVHJhbnNsYXRpb25cXEVkaXRvci9zcmNcXGFwcFxcdXNlclxcdXNlci5jb21wb25lbnQuc2FzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQTtFQUNJLFlBQVk7RUFDWixpQkFBaUI7RUFDakIsaUJBQWlCLEVBQUEiLCJmaWxlIjoic3JjL2FwcC91c2VyL3VzZXIuY29tcG9uZW50LnNhc3MiLCJzb3VyY2VzQ29udGVudCI6WyJcbmltZyB7XG4gICAgaGVpZ2h0OiAzMnB4O1xuICAgIG1hcmdpbjogMCA4cHggMCAwO1xuICAgIGJvcmRlci1yYWRpdXM6IDUlOyB9XG4iXX0= */"

/***/ }),

/***/ "./src/app/user/user.component.ts":
/*!****************************************!*\
  !*** ./src/app/user/user.component.ts ***!
  \****************************************/
/*! exports provided: UserComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "UserComponent", function() { return UserComponent; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var src_services_github_oauth_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! src/services/github-oauth.service */ "./src/services/github-oauth.service.ts");



var UserComponent = /** @class */ (function () {
    function UserComponent(github) {
        this.github = github;
    }
    UserComponent.prototype.ngOnInit = function () {
        return tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"](this, void 0, void 0, function () {
            var _a;
            return tslib__WEBPACK_IMPORTED_MODULE_0__["__generator"](this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.github.token) return [3 /*break*/, 2];
                        _a = this;
                        return [4 /*yield*/, this.github.getCurrentUser()];
                    case 1:
                        _a.user = _b.sent();
                        _b.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    UserComponent.prototype.logIn = function () {
        return tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"](this, void 0, void 0, function () {
            var _a;
            return tslib__WEBPACK_IMPORTED_MODULE_0__["__generator"](this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.github.logInIfNeeded()];
                    case 1:
                        if (!_b.sent()) return [3 /*break*/, 3];
                        _a = this;
                        return [4 /*yield*/, this.github.getCurrentUser()];
                    case 2:
                        _a.user = _b.sent();
                        _b.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    UserComponent.prototype.logOut = function () {
        this.github.logOut();
        this.user = null;
    };
    UserComponent.prototype.reviewSettings = function () {
        window.open(this.github.reviewUrl, '_blank');
    };
    UserComponent = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
            selector: 'app-user',
            template: __webpack_require__(/*! ./user.component.html */ "./src/app/user/user.component.html"),
            styles: [__webpack_require__(/*! ./user.component.sass */ "./src/app/user/user.component.sass")]
        }),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [src_services_github_oauth_service__WEBPACK_IMPORTED_MODULE_2__["GithubOauthService"]])
    ], UserComponent);
    return UserComponent;
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

/***/ "./src/services/api-endpoint.service.ts":
/*!**********************************************!*\
  !*** ./src/services/api-endpoint.service.ts ***!
  \**********************************************/
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
    ApiEndpointService.prototype.makePath = function (root, path) {
        if (path.startsWith('/') || path === '') {
            return root + path;
        }
        else {
            return root + '/' + path;
        }
    };
    ApiEndpointService.prototype.github = function (path) {
        if (path === void 0) { path = ''; }
        return this.makePath('https://api.github.com', path);
    };
    ApiEndpointService.prototype.ehTagConnector = function (path) {
        if (path === void 0) { path = ''; }
        return this.makePath('https://ehtagconnector.azurewebsites.net/api/database', path);
    };
    ApiEndpointService = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Injectable"])({
            providedIn: 'root'
        })
    ], ApiEndpointService);
    return ApiEndpointService;
}());



/***/ }),

/***/ "./src/services/eh-http-interceptor.ts":
/*!*********************************************!*\
  !*** ./src/services/eh-http-interceptor.ts ***!
  \*********************************************/
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
/* harmony import */ var _github_oauth_service__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./github-oauth.service */ "./src/services/github-oauth.service.ts");
/* harmony import */ var _eh_tag_connector_service__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./eh-tag-connector.service */ "./src/services/eh-tag-connector.service.ts");
/* harmony import */ var _api_endpoint_service__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./api-endpoint.service */ "./src/services/api-endpoint.service.ts");







var EhHttpInterceptor = /** @class */ (function () {
    function EhHttpInterceptor(githubOauth, ehTagConnector, endpoints) {
        this.githubOauth = githubOauth;
        this.ehTagConnector = ehTagConnector;
        this.endpoints = endpoints;
    }
    EhHttpInterceptor_1 = EhHttpInterceptor;
    EhHttpInterceptor.debugLog = function (category, data) {
        if (Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["isDevMode"])()) {
            console.log(category, data);
        }
    };
    EhHttpInterceptor.prototype.handleEag = function (response) {
        if (response.url.startsWith(this.endpoints.ehTagConnector())) {
            // `W/` might be added by some CDN
            var etag = (response.headers.get('etag').match(/^(W\/)?"(\w+)"$/) || [])[2];
            if (etag) {
                EhHttpInterceptor_1.debugLog('etag', etag);
                this.ehTagConnector.hash = etag;
            }
        }
    };
    EhHttpInterceptor.prototype.intercept = function (req, next) {
        var _this = this;
        var authReq = req;
        var token = this.githubOauth.token;
        if (req.url.startsWith(this.endpoints.github()) && token) {
            /**
             * use `access_token` for more rate limits
             * @see https://developer.github.com/v3/#rate-limiting
             */
            authReq = req.clone({
                setParams: { access_token: token }
            });
        }
        if (req.url.startsWith(this.endpoints.ehTagConnector())) {
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
        EhHttpInterceptor_1.debugLog('req', authReq);
        return next.handle(authReq).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["tap"])(function (response) {
            EhHttpInterceptor_1.debugLog('tap', response);
            if (response.type === _angular_common_http__WEBPACK_IMPORTED_MODULE_3__["HttpEventType"].Response) {
                _this.handleEag(response);
            }
        }), Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_2__["catchError"])(function (err) {
            EhHttpInterceptor_1.debugLog('catchError', err);
            if (err.name === _angular_common_http__WEBPACK_IMPORTED_MODULE_3__["HttpErrorResponse"].name) {
                _this.handleEag(err);
            }
            throw err;
        }));
    };
    var EhHttpInterceptor_1;
    EhHttpInterceptor = EhHttpInterceptor_1 = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Injectable"])(),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [_github_oauth_service__WEBPACK_IMPORTED_MODULE_4__["GithubOauthService"],
            _eh_tag_connector_service__WEBPACK_IMPORTED_MODULE_5__["EhTagConnectorService"],
            _api_endpoint_service__WEBPACK_IMPORTED_MODULE_6__["ApiEndpointService"]])
    ], EhHttpInterceptor);
    return EhHttpInterceptor;
}());

var ehHttpInterceptorProvider = { provide: _angular_common_http__WEBPACK_IMPORTED_MODULE_3__["HTTP_INTERCEPTORS"], useClass: EhHttpInterceptor, multi: true };


/***/ }),

/***/ "./src/services/eh-tag-connector.service.ts":
/*!**************************************************!*\
  !*** ./src/services/eh-tag-connector.service.ts ***!
  \**************************************************/
/*! exports provided: EhTagConnectorService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "EhTagConnectorService", function() { return EhTagConnectorService; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common/http */ "./node_modules/@angular/common/fesm5/http.js");
/* harmony import */ var _api_endpoint_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./api-endpoint.service */ "./src/services/api-endpoint.service.ts");




var EH_TAG_HASH = 'eh-tag-hash';
var EH_TAG_DATA = 'eh-tag-data';
var EhTagConnectorService = /** @class */ (function () {
    // https://ehtagconnector.azurewebsites.net/api/database
    function EhTagConnectorService(http, endpoints) {
        this.http = http;
        this.endpoints = endpoints;
        this.hashChange = new _angular_core__WEBPACK_IMPORTED_MODULE_1__["EventEmitter"]();
        this.hash = localStorage.getItem(EH_TAG_HASH);
        var data = localStorage.getItem(EH_TAG_DATA);
        if (data) {
            this.tags = JSON.parse(data);
        }
    }
    Object.defineProperty(EhTagConnectorService.prototype, "hash", {
        get: function () {
            return this.hashStr;
        },
        set: function (value) {
            var oldVal = this.hashStr;
            if (oldVal === value) {
                return;
            }
            this.hashStr = value;
            this.onHashChange(oldVal, value);
        },
        enumerable: true,
        configurable: true
    });
    EhTagConnectorService.prototype.onHashChange = function (oldValue, newValue) {
        console.log("hash: " + oldValue + " -> " + newValue);
        this.hashChange.emit(newValue);
        this.tags = null;
        localStorage.setItem(EH_TAG_HASH, newValue);
    };
    EhTagConnectorService.prototype.getEndpoint = function (item) {
        return this.endpoints.ehTagConnector(item.namespace + "/" + item.raw.trim().toLowerCase() + "?format=raw.json");
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
    EhTagConnectorService.prototype.getHash = function () {
        return tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"](this, void 0, void 0, function () {
            return tslib__WEBPACK_IMPORTED_MODULE_0__["__generator"](this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.http.head(this.endpoints.ehTagConnector()).toPromise()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    EhTagConnectorService.prototype.getTags = function () {
        return tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"](this, void 0, void 0, function () {
            var endpoint, release, assetUrl, promise, script, data, tags_1, e_1;
            return tslib__WEBPACK_IMPORTED_MODULE_0__["__generator"](this, function (_a) {
                switch (_a.label) {
                    case 0:
                        endpoint = this.endpoints.github('repos/ehtagtranslation/Database/releases/latest');
                        return [4 /*yield*/, this.http.get(endpoint).toPromise()];
                    case 1:
                        release = _a.sent();
                        this.hash = release.target_commitish;
                        if (this.tags) {
                            return [2 /*return*/, this.tags];
                        }
                        assetUrl = release.assets.find(function (i) { return i.name === 'db.raw.js'; }).browser_download_url;
                        promise = new Promise(function (resolve, reject) {
                            var timeoutGuard;
                            var close = function () {
                                clearTimeout(timeoutGuard);
                                globalThis.load_ehtagtranslation_database = null;
                            };
                            timeoutGuard = setTimeout(function () {
                                reject(new Error('Get EhTag Timeout'));
                                close();
                            }, 30 * 1000);
                            globalThis.load_ehtagtranslation_database = function (data) {
                                resolve(data);
                                close();
                            };
                        });
                        script = document.createElement('script');
                        script.setAttribute('src', assetUrl);
                        document.getElementsByTagName('head')[0].appendChild(script);
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, promise];
                    case 3:
                        data = _a.sent();
                        this.hash = data.head.sha;
                        tags_1 = [];
                        data.data.forEach(function (namespace) {
                            for (var raw in namespace.data) {
                                if (namespace.data.hasOwnProperty(raw)) {
                                    var element = namespace.data[raw];
                                    tags_1.push(tslib__WEBPACK_IMPORTED_MODULE_0__["__assign"]({}, element, { raw: raw, namespace: namespace.namespace }));
                                }
                            }
                        });
                        this.tags = tags_1;
                        localStorage.setItem(EH_TAG_DATA, JSON.stringify(tags_1));
                        return [2 /*return*/, tags_1];
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

/***/ "./src/services/github-oauth.service.ts":
/*!**********************************************!*\
  !*** ./src/services/github-oauth.service.ts ***!
  \**********************************************/
/*! exports provided: GithubOauthService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "GithubOauthService", function() { return GithubOauthService; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common/http */ "./node_modules/@angular/common/fesm5/http.js");
/* harmony import */ var _api_endpoint_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./api-endpoint.service */ "./src/services/api-endpoint.service.ts");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/common */ "./node_modules/@angular/common/fesm5/common.js");





var clientId = '2f2070671bda676ddb5a';
var windowName = 'githubOauth';
var localStorageKey = 'github_oauth_token';
var GithubOauthService = /** @class */ (function () {
    function GithubOauthService(httpClient, location, endpoints) {
        this.httpClient = httpClient;
        this.location = location;
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
                        return [4 /*yield*/, this.httpClient.get(this.endpoints.github('user')).toPromise()];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        ex_1 = _a.sent();
                        if (ex_1.status === 401 && this.token === token) {
                            // token is invalid.
                            this.setToken();
                        }
                        throw new Error('Invalid token');
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
        var callback = location.origin + this.location.prepareExternalUrl('/assets/callback.html');
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
            _angular_common__WEBPACK_IMPORTED_MODULE_4__["Location"],
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
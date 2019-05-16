import { Injectable } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { IMultiSelectOption } from 'angular-2-dropdown-multiselect';


@Injectable({ providedIn: 'root' })
export class CmsLibraryVar {
        
    

    //  btns = {
    //     "ok":'Ok',
    //     "cancel":'Cancel',
    //     "save": "Save",
    //     "print": "Print",
    //     "workinProgress" : "Work in Progress",
    //     "scheduleTraining" : "Schedule a Training",
    //     "createNotification" : "Create Notification",
    //     "createCourse" : "Create Course"
    // }
    fileId;
    modalRef: BsModalRef;
    errorValidate = false;
    errorValidation;
    resortList: IMultiSelectOption[];
    divisionList: IMultiSelectOption[];
    departmentList: IMultiSelectOption[];
    employeeList: IMultiSelectOption[];
    selectedDepartment = [];
    selectedEmp = [];
    selectedDivision = [];
    selectedResort;
    modalConfig;
    divisionId;
    departmentId;
    departmentSettings = {
      singleSelection: false,
      idField: 'departmentId',
      textField: 'departmentName',
      enableCheckAll: false,
      itemsShowLimit: 8,
      }
      resortSettings = {
      singleSelection: false,
      idField: 'resortId',
      textField: 'resortName',
      enableCheckAll: false,
      itemsShowLimit: 8,
      }
      empSettings = {
      singleSelection: false,
      idField: 'userId',
      textField: 'userName',
      enableCheckAll: false,
      itemsShowLimit: 8,
      }
      divisionSettings = {
      singleSelection: false,
      idField: 'divisionId',
      textField: 'divisionName',
      enableCheckAll: false,
      itemsShowLimit: 8,
      }




}
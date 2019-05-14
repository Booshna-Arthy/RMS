import { Component, OnInit,Input,TemplateRef , EventEmitter, Output} from '@angular/core';
import { HeaderService, HttpService, CourseService, AlertService, FileService } from '../../services';
import { CmsLibraryVar } from '../../Constants/cms-library.var';
import { CommonLabels } from '../../Constants/common-labels.var';
import { BsModalService } from 'ngx-bootstrap/modal';


@Component({
  selector: 'app-document-tab',
  templateUrl: './document-tab.component.html',
  styleUrls: ['./document-tab.component.css']
})
export class DocumentTabComponent implements OnInit {
  @Input() trainingClassId;
  @Input() uploadPage;
  totalVideosCount = 0;
  videoListValue = [];
  addVideosToCourse = false;
  page;
  pageSize;
  p;
  total;
  selectedCourse="";
  selectedClass="";
  courseList;
  submitted=false;
  trainingClassList;
  fileList=[];
  deletedFilePath=[];
  deletedFileId=[];
  uploadPath;

  @Input() CMSFilterSearchEventSet;
  @Output() selectedVideos  = new EventEmitter<object>();


  constructor(private courseService: CourseService, private fileService: FileService,private alertService: AlertService,public commonLabels : CommonLabels,public constant: CmsLibraryVar, private modalService : BsModalService) { 

  }

  ngOnInit(){
    this.pageSize = 10;
    this.page=1;
    this.getCourseFileDetails();
    this.getCourseAndTrainingClass();
  }
  ngDoCheck(){
    if(this.CMSFilterSearchEventSet !== undefined && this.CMSFilterSearchEventSet !== ''){
      this.getCourseFileDetails();
    }
  }

  getCourseAndTrainingClass(){
    this.courseService.getAllCourse().subscribe(result=>{
      if(result && result.isSuccess){
        this.courseList = result.data && result.data.rows;
      }
    })
  }

  openFileContent(data){
    let url = this.uploadPath+data.fileUrl;
      window.open(url, "_blank");
  }

 

   courseChange(){
     this.selectedClass="";
      this.courseService.getTrainingclassesById(this.selectedCourse).subscribe(result=>{
      if(result && result.isSuccess){       
           this.trainingClassList = result.data;
        }
    })
   }

//Remove selected video from form
  removeVideo(data,i){
     this.videoListValue.filter(function (x) {
           if(x.fileId == data.fileId){
             return x.selected = false; 
           }    
    }); 
    this.fileList.splice(i,1);
    this.deletedFilePath.push(data.fileUrl);
    this.deletedFileId.push(data.fileId);
    if(data.fileType === 'Video'){
      this.deletedFilePath.push(data.fileImage);
    }
  }


  //Get document list for selected course and training class.
  getEditFileData(){
      this.courseService.getEditCourseDetails( 'Document',this.selectedCourse,this.selectedClass).subscribe(resp => {
        if(resp && resp.isSuccess){
          let files = resp.data.length && resp.data[0].CourseTrainingClassMaps.length && resp.data[0].CourseTrainingClassMaps[0].TrainingClass && resp.data[0].CourseTrainingClassMaps[0].TrainingClass.Files.length ? resp.data[0].CourseTrainingClassMaps[0].TrainingClass.Files : [] ;
          if(this.fileList){
           files.map(x=>{
             this.fileList.push(x);
           })
          }else{
           this.fileList= files;
          }
        }
      })
  }

 //Send selected files to cms library component.
  AddFilestoEditCourse(){
    this.selectedVideos.emit(this.fileList);
  }


 //Get document list 
  getCourseFileDetails() {
    let query = this.courseService.searchQuery(this.CMSFilterSearchEventSet);
    let classId = this.trainingClassId ? this.trainingClassId : '';
    let params={
      type: 'Document',
      classId: classId,
      page: this.page,
      size: this.pageSize,
      query: query
    }
    let selectedDocuments = this.fileService.getSelectedList('Document');
    this.courseService.getFiles(params).subscribe(resp => {
      this.CMSFilterSearchEventSet = '';
      if (resp && resp.isSuccess) {
        this.totalVideosCount = resp.data.count;
        if(resp.data.count === 0)
        {
          this.videoListValue = [];
        }else{
           this.videoListValue = resp.data && resp.data.rows.length ? resp.data.rows : []; 
            console.log(_.merge(this.videoListValue, selectedDocuments));
        this.uploadPath = resp.data && resp.data.uploadPaths ? resp.data.uploadPaths.uploadPath : '';
      }
       }
    },err =>{
      this.CMSFilterSearchEventSet = '';
    });
  
  }

  formatBytes(bytes, decimals = 2) {
    if (bytes === 0 || bytes === null) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

  //Hide and show Assign form popup 
  openAddVideosToCourse(){
    this.addVideosToCourse = !this.addVideosToCourse;
  }

  pageChanged(e){
    this.page = e;
    this.getCourseFileDetails();
  }

 //Add or remove files from list
   addFiles(event,file,i){
    let type=event.target.checked;
    if(type){
      file['addNew'] = true;
      file['selected'] = true;
      this.fileList.push(file);
      this.fileService.saveFileList('add',file);

    }else{
      let index = this.fileList.findIndex(x => x.fileId === file.fileId);
      file['selected'] = false;
      this.fileList.splice(index,1);
      this.fileService.saveFileList('remove',file);

    }
  }


  //Open delete warning modal
   removeDoc(template: TemplateRef<any>,fileId, i) {
    let modalConfig={
      class : "modal-dialog-centered"
    }

     this.constant.fileId= fileId;
     this.constant.modalRef = this.modalService.show(template,modalConfig); 
    }

  //Delete document
  deleteDoc(){
  this.courseService.deleteDocument(this.constant.fileId).subscribe((result)=>{
      if(result.isSuccess){
          this.constant.modalRef.hide();
          this.getCourseFileDetails();
          this.alertService.success(result.message);
      }
  })
  }

 //Assign document files to selected course and training class
  AssignNewFiles(){
      this.submitted=true;
      let self =this;
      let updatedFileList = this.fileList.filter(function (x) {
          if(x.addNew){
            x.trainingClassId = self.selectedClass;
            return delete x.addNew && delete x.TrainingClass;
          }
      }); 
      let fileIds = updatedFileList.map(a => a.fileId);
      updatedFileList.forEach(function(x){ delete x.fileId });
      let postData = {
        trainingClassId : this.selectedClass,
        courseId : this.selectedCourse,
        fileType :"document",
        assignedFiles: updatedFileList,
        filesIds: fileIds,
     }

    if(this.submitted && this.selectedClass && this.selectedCourse){
      this.courseService.assignVideosToCourse(postData).subscribe(res=>{
            if(res.isSuccess){
              this.alertService.success(res.message);
              this.openAddVideosToCourse();
              this.resetAssignForm();
              this.videoListValue.map(function (x) {
                return x.selected = false;     
              }); 
            }
      })
    }
  }

  //To reset form.
  resetAssignForm(){
    this.selectedClass = "";
    this.selectedCourse = "";
    this.fileList =[];
    this.submitted=false;
  }


}

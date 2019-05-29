import { Component, OnInit ,Input,Output,EventEmitter,TemplateRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { HeaderService } from '../../services/header.service';
import { HttpService } from '../../services/http.service';
import { QuizVar } from '../../Constants/quiz.var';
import { CourseService } from '../../services/restservices/course.service';
import { API_URL } from '../../Constants/api_url';
import { AlertService } from '../../services/alert.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { CommonLabels } from '../../Constants/common-labels.var'

@Component({
  selector: 'create-quiz',
  templateUrl: './add-quiz.component.html',
  styleUrls: ['./add-quiz.component.css']

})
export class CreateQuizComponent implements OnInit {
  courseUpdate = false;
  videoDetails = [];
  // courseId;
  // videoId;
  questionForm;
  weightage;
  questionOptions = [];
  courseOptions = [];
  videoOptions = [];
  optionType = false;
  videoName;
  selectedVideo;
  selectedCourse;
  quizQuestionsForm = [];
  title;
  apiUrls;
  hidemodule = false;
  optionData = true;
  modalRef;
  removedQuizIds = [];
  quizName;

  constructor(private modalService: BsModalService,private courseService:CourseService,private headerService: HeaderService,private alertService:AlertService, private route: Router, private http: HttpService, private activatedRoute: ActivatedRoute, public constant: QuizVar,private toastr: ToastrService,
    public commonLabels:CommonLabels,public location : Location) {
    this.apiUrls = API_URL.URLS;
  }
  
  ngOnInit() {
    this.headerService.setTitle({title:this.commonLabels.titles.cmsLibrary, hidemodule:false});
    this.questionOptions = [
      { name: "MCQ", value: "MCQ" },
      { name: "True/False", value: "True/False" },
      { name: "Non-MCQ", value: "NON-MCQ" }
    ];
    this.quizQuestionsForm = [{
      "questionName": "",
      "questionType": "MCQ",
      "options": [
        { "optionId": 1, "optionName": "" },
        { "optionId": 2, "optionName": "" },
        { "optionId": 3, "optionName": "" },
        { "optionId": 4, "optionName": "" }
      ],
      "weightage": '100',
      "answer" : ''
    }];

    // if(this.enableQuiz){
    //   this.editQuizDetails(this.quizDetails);
    // }
    // else {
      this.weightage = 100;
    // }
  }

  optionValueUpdate(event,i){
    this.optionData = !this.optionData;
    this.quizQuestionsForm[i].answer = parseInt(event.target.value) === 0 ? 'false' : 'true';
  }
  
  editQuizDetails(quizData){
      this.quizQuestionsForm = [{
        "questionName": "",
        "questionType": "MCQ",
        "options": [
          { "optionId": 1, "optionName": "" },
          { "optionId": 2, "optionName": "" },
          { "optionId": 3, "optionName": "" },
          { "optionId": 4, "optionName": "" }
        ],
        "weightage": '100',
        "answer" : ''
      }];
      // this.weightage = selectedVideoList && selectedVideoList  ? (100 / selectedVideoList.length).toFixed(2) : 100;
    // });
  }
   // Select options toggle
  questionTypeUpdate(data, i) {
    let quiz = this.quizQuestionsForm;
    quiz[i].QuestionType = data;
    if (data === "MCQ") {
      quiz[i].option = '';
      quiz[i].answer = '';
      quiz[i].options = [
        { "optionId": 1, "OptionName": "" },
        { "optionId": 2, "OptionName": "" },
        { "optionId": 3, "OptionName": "" },
        { "optionId": 4, "OptionName": "" }
      ];
    }
    else if(data === "True/False"){
      quiz[i].options = [];
      quiz[i].option = "True/False";
      quiz[i].answer = 'true';
    }
    else{
      quiz[i].options = [];
      quiz[i].option = '';
      quiz[i].answer = '';
    }
  }


  courseChange(){
    // // this.selectedCourse = 1;
    // console.log(this.selectedCourse);
  }

  // Add Question Box
  addQuestionForm() {
    let obj;
      obj = {
        "questionName": "",
        "questionType": "MCQ",
        "options": [
          { "optionId": 1, "optionName": "" },
          { "optionId": 2, "optionName": "" },
          { "optionId": 3, "optionName": "" },
          { "optionId": 4, "optionName": "" }
        ],
        "weightage": '100',
        "answer" : ''
      };
    // obj.trainingClassId = this.courseId;
    this.quizQuestionsForm.push(obj);
    obj.weightage = (100 / this.quizQuestionsForm.length).toFixed(2);
    this.weightage  = (100 / this.quizQuestionsForm.length).toFixed(2);
  }

  // Remove Question Box
  removeQuestionForm(index,data) {
    if(this.quizQuestionsForm.length>1){
      this.quizQuestionsForm.splice(index, 1);
      this.weightage  = (100 / this.quizQuestionsForm.length).toFixed(2);
    }
    else{
      this.alertService.warn(this.commonLabels.mandatoryLabels.minimumQuiz);
    }
  }

  valueChanged(resp,submitCheck,update){
    this.courseUpdate = true;
    let data = {
      courseUpdate : submitCheck,
    }
    // this.valueChange.emit(data);
  }

  // Quiz Submission
  quizSubmit(submitType) {
    //Weightage update   
      let data = this.quizQuestionsForm.map(item => {
          item.weightage = (100 / this.quizQuestionsForm.length).toFixed(2);
          return item;
      })
      console.log(data,this.quizName)
  }

  goTocmsLibrary(data){
    if(data){
        this.route.navigate(['/cms-library'],{queryParams:{type : 'edit',tab : 'course'}})
    }
    else{
        this.location.back(); 
    }
}

}
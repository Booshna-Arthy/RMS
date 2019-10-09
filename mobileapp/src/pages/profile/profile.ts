import { Component, OnInit, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Content } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Constant } from '../../constants/Constant.var';
import { API_URL } from '../../constants/API_URLS.var';
import { HttpProvider } from '../../providers/http/http';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService, DataService, LoaderService} from '../../service';


@IonicPage({
  name: 'profile-page'
})
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
  providers: [Constant]
})
export class ProfilePage implements OnInit {
  @ViewChild(Content) content: Content;
  currentUser;
  profileDetail;
  profileForm: FormGroup;
  profile = {
    // 'userName' : '',
    'mobile':'',
    'email':''
  }
  designation;
   processing:boolean;
  uploadImage: string;
  className;
  showToastr=false;
  msgTitle;
  msgDes;
  previewProfilePic;
  profileFile;
  desigList=[];
  departList=[];
 
  constructor(public navCtrl: NavController,public http: HttpProvider
  ,public navParams: NavParams,public loader: LoaderService,public dataService: DataService,public toastr: ToastrService,public storage: Storage, public constant: Constant) {
  }

  ionViewDidLoad() {  
        this.getDetails();  
  }
  
  ngOnInit() {
    let EMAILPATTERN = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
    let MOBILEPATTERN = /^(\d{10}|\d{11}|\d{12})$/;
     this.profileForm = new FormGroup({
      // userName: new FormControl('', [Validators.required]),
      mobile: new FormControl('', [Validators.required, Validators.pattern(MOBILEPATTERN)]),
      email: new FormControl('', [Validators.required, Validators.pattern(EMAILPATTERN)]),
    });
  }

  getDetails() {
    let self = this;
    this.storage.get('currentUser').then(
      (val) => {
        if (val) {
          self.currentUser = val;
          this.getUserProfile();
        }
      }, (err) => {
        console.log('currentUser not received in profile.component.ts', err);
      });    
  }

  getUserProfile(){
    let userId = this.currentUser.userId;
    this.http.get(API_URL.URLS.getProfile+'?userId='+userId).subscribe((res)=>{
       if(res['isSuccess']){
         this.profileDetail = res['data']['rows'][0];
          let uploadPath = res['data']['uploadPath']['uploadPath'];
          this.profileDetail.ResortUserMappings.filter(val=>{
           if(val.Designation != null){
            this.desigList.push(val.Designation.designationName);
           }
         })
         this.profileDetail.ResortUserMappings.filter(val => {
             if (val.Department != null) {
                 this.departList.push(val.Department.departmentName);
             }
         })
         this.profile.userName = this.profileDetail.userName;
         this.profile.mobile = this.profileDetail.phoneNumber;
         this.profile.email = this.profileDetail.email;
         this.previewProfilePic = uploadPath+ this.profileDetail.userImage;
       }
    })
  }

  // removeComma(str){
  //  return str.replace(/,\s*$/, "");
  // }

  updateProfile(){
    let userId = this.currentUser.userId;
    let postData = {
      "userName": this.profile.userName,
      "email":this.profile.email,
      "phoneNumber":this.profile.mobile
    }
    this.loader.showLoader();
    this.http.put(false,API_URL.URLS.updateProfile+userId, postData).subscribe((res)=>{
      this.loader.hideLoader();
      if(res['isSuccess']){
        this.content.scrollToTop();
        this.showToastr=true;
        this.className = "notify-box alert alert-success";
        this.msgTitle = "Success";
        this.msgDes=res['message'];
        let self = this;
          setTimeout(function(){ 
          self.navCtrl.push('home-page');
          }, 3000);     
      }
    })
  }

 //Image upload
  uploadImg(e) {
   let reader = new FileReader();
   if (e.target && e.target.files[0]) {
       let file = e.target.files[0];
       this.profileFile = file;
       reader.onloadend = () => {
           this.previewProfilePic = reader.result;
       }
       reader.readAsDataURL(file);
   }
 
    this.http.upload(API_URL.URLS.uploadFiles, this.profileFile).subscribe(res => {
       if(res['isSuccess']){
         this.storage.get('currentUser').then(valueStr => {
             // Modify just that property
             valueStr.userImage = res['data'][0]['filename'];
             // Save the entire data again
             this.storage.set('currentUser', valueStr);
         });
         this.updateProfilePic(res['data'][0]['filename']);
       }
    })
  }
 

  updateProfilePic(name){
    let userId = this.currentUser.userId;
    let postData = {
       "userImage" : name
    }
    this.loader.showLoader();
    this.http.put(false, API_URL.URLS.updateProfile + userId, postData).subscribe((res) => {
      this.loader.hideLoader();
        if (res['isSuccess']) {
            this.content.scrollToTop();
            this.showToastr = true;
            this.className = "notify-box alert alert-success";
            this.msgTitle = "Success";
            this.msgDes = res['message'];
            let self = this;
            setTimeout(function() {
                self.navCtrl.push('home-page');
            }, 3000);

            this.storage.get('currentUser').then(valueStr => {
                 this.dataService.sendLoginData(valueStr);
            });
        }
    })
  }


    getOrientation(file, callback) {
    var reader = new FileReader();
    reader.onload = function (e:any) {

      var view = new DataView(e.target.result);
      if (view.getUint16(0, false) != 0xFFD8) return callback(-2);
      var length = view.byteLength, offset = 2;
      while (offset < length) {
        var marker = view.getUint16(offset, false);
        offset += 2;
        if (marker == 0xFFE1) {
          if (view.getUint32(offset += 2, false) != 0x45786966) return callback(-1);
          var little = view.getUint16(offset += 6, false) == 0x4949;
          offset += view.getUint32(offset + 4, little);
          var tags = view.getUint16(offset, little);
          offset += 2;
          for (var i = 0; i < tags; i++)
            if (view.getUint16(offset + (i * 12), little) == 0x0112)
              return callback(view.getUint16(offset + (i * 12) + 8, little));
        }
        else if ((marker & 0xFF00) != 0xFF00) break;
        else offset += view.getUint16(offset, false);
      }
      return callback(-1);
    };
    reader.readAsArrayBuffer(file);
  }
  resetOrientation(srcBase64, srcOrientation, callback) {
    var img = new Image();

    img.onload = function () {
      var width = img.width,
        height = img.height,
        canvas = document.createElement('canvas'),
        ctx = canvas.getContext("2d");

      // set proper canvas dimensions before transform & export
      if (4 < srcOrientation && srcOrientation < 9) {
        canvas.width = height;
        canvas.height = width;
      } else {
        canvas.width = width;
        canvas.height = height;
      }

      // transform context before drawing image
      switch (srcOrientation) {
        case 2: ctx.transform(-1, 0, 0, 1, width, 0); break;
        case 3: ctx.transform(-1, 0, 0, -1, width, height); break;
        case 4: ctx.transform(1, 0, 0, -1, 0, height); break;
        case 5: ctx.transform(0, 1, 1, 0, 0, 0); break;
        case 6: ctx.transform(0, 1, -1, 0, height, 0); break;
        case 7: ctx.transform(0, -1, -1, 0, height, width); break;
        case 8: ctx.transform(0, -1, 1, 0, 0, width); break;
        default: break;
      }

      // draw image
      ctx.drawImage(img, 0, 0);

      // export base64
      callback(canvas.toDataURL());
    };

    img.src = srcBase64;
  }



  goToProfile() {
    this.navCtrl.push('profile-page');
  }
  goToPrevious(){
    this.navCtrl.push('home-page');
  }


}

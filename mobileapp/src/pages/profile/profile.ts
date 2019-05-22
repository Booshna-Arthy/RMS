import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Constant } from '../../constants/Constant.var';
import { API_URL } from '../../constants/API_URLS.var';
import { HttpProvider } from '../../providers/http/http';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from '../../service/toastrService';


@IonicPage({
  name: 'profile-page'
})
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
  providers: [Constant]
})
export class ProfilePage implements OnInit {
  currentUser;
  profileDetail;
  profileForm: FormGroup;
  profile = {
    'userName' : '',
    'mobile':'',
    'email':''
  }
  designation=[];
   processing:boolean;
  uploadImage: string;

  constructor(public navCtrl: NavController,public http: HttpProvider
  ,public navParams: NavParams, public toastr: ToastrService,public storage: Storage, public constant: Constant) {
  }

  ionViewDidLoad() {  
        this.getDetails();  
  }
  
  ngOnInit() {
    let EMAILPATTERN = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
     this.profileForm = new FormGroup({
      userName: new FormControl('', [Validators.required]),
      mobile: new FormControl('', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(10), Validators.maxLength(12)]),
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
    console.log(API_URL.URLS.getProfile+'?userId=');
    this.http.get(API_URL.URLS.getProfile+'?userId='+userId).subscribe((res)=>{
       if(res['isSuccess']){
         this.profileDetail = res['data']['rows'][0];
         this.profile.userName = this.profileDetail.userName;
         this.profile.mobile = this.profileDetail.phoneNumber;
         this.profile.email = this.profileDetail.email;
         this.profileDetail.ResortUserMappings.map(key =>{
            if(key.Designation){
              this.designation.push(key.Designation.designationName+',');
            }
            console.log(this.designation)
         })
       }
    })
  }

  removeComma(str){
   return str.replace(/,\s*$/, "");
  }

  updateProfile(){
    let userId = this.currentUser.userId;
    let postData = {
      "userName": this.profile.userName,
      "email":this.profile.email,
      "phoneNumber":this.profile.mobile
    }
    this.http.put(false,API_URL.URLS.updateProfile+userId, postData).subscribe((res)=>{
      if(res['isSuccess']){
        this.toastr.success(res['result']);
        this.navCtrl.setRoot('home-page');
      }
    })
  }


  uploadImg(fileLoader) {
      fileLoader.click();
      var that = this;
      fileLoader.onchange = function () {
        var file = fileLoader.files[0];
        var reader = new FileReader();

        reader.addEventListener("load", function () {
          that.processing = true;
          that.getOrientation(fileLoader.files[0], function (orientation) {
            if (orientation > 1) {
              that.resetOrientation(reader.result, orientation, function (resetBase64Image) {
                that.uploadImage = resetBase64Image;
              });
            } else {
              that.uploadImage = reader.result;
              console.log(this.uploadImage,"Upload Image");
            }
          });
        }, false);

        if (file) {
          reader.readAsDataURL(file);
        }
      }
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
    this.navCtrl.setRoot('profile-page');
  }
  goToPrevious(){
    this.navCtrl.setRoot('home-page');
  }


}

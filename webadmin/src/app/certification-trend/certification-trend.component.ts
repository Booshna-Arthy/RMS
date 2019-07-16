import { Component, OnInit } from '@angular/core';
import { CommonService, BreadCrumbService, HeaderService, UtilService,PDFService,ExcelService } from '../services';
import { CommonLabels } from '../Constants/common-labels.var'
import { VideosTrendVar } from '../Constants/videostrend.var';
import { Location } from '@angular/common'; 

@Component({
  selector: 'app-certification-trend',
  templateUrl: './certification-trend.component.html',
  styleUrls: ['./certification-trend.component.css']
})
export class CertificationTrendComponent implements OnInit {

  pageLimitOptions;
  pageLimit;
  search='';
  trendList = [];
  xlsxList =[];
  resortId;
  constructor(public location: Location, private commonService: CommonService, public commonLabels: CommonLabels,private excelService: ExcelService,private pdfService:PDFService,private breadCrumbService: BreadCrumbService, private headerService: HeaderService, private utilService: UtilService,public trendsVar: VideosTrendVar) {
    this.pageLimitOptions = [5, 10, 25];
    this.pageLimit = [this.pageLimitOptions[0]];
  }
  ngOnInit() {
    this.headerService.setTitle({ title: this.commonLabels.labels.certifiTrend, hidemodule: false });
    this.breadCrumbService.setTitle([]);
    this.resortId = this.utilService.getUserData() && this.utilService.getUserData().ResortUserMappings[0].Resort.resortId;
    this.getTrendCountList();
  }
  // getTrendList() {
  //   let query = this.search ? "?search=" + this.search : '';
  //   this.commonService.getCertificateTrendList(query).subscribe((res) => {
  //     if (res.isSuccess) {
  //       this.trendList = res.data.rows.length ? res.data.rows : [];
  //     }
  //   });
 // }
  
  getTrendCountList() {
    let query = this.resortId ? "?resortId=" + this.resortId + "&search=" + this.search  : '';

    console.log(query)
    this.commonService.certificateTrendCount(query).subscribe((res) => {
      if (res.isSuccess) {
        this.trendList = res.data.rows.length ? res.data.rows : [];
      } else {
        this.trendList = [];
      }
      // console.log(this.trendList);
    });
  }

  ngOnDestroy() {
    this.search = '';
  }
  resetSearch() {
    this.search = '';
    this.getTrendCountList();
  }
  
  // Create PDF
  exportAsPDF(){ 
    var data = document.getElementById('trendList'); 
    this.pdfService.htmlPDFFormat(data,this.commonLabels.labels.certifiTrend);  
  }

  // Create Excel sheet
  exportAsXLSX():void {
    
    
    this.trendList.map(item=>{
        let list = {
          "Course Name": item.courseName,
          "Assigned Count": item.assignedCount,
          "Completed Count": item.completedCount
        };
       this.xlsxList.push(list);
    })
    console.log(this.xlsxList, "trend")
    this.excelService.exportAsExcelFile(this.xlsxList, this.commonLabels.labels.certifiTrend);
  }

  onPrint() {
    window.print();
  }
}

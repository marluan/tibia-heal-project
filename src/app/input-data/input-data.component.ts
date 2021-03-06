import { Component, OnInit } from '@angular/core';
import { UserLogs } from '../models/user-logs';
import * as XLSX from 'xlsx';
import { BeforeAfter } from '../models/before-after';

@Component({
  selector: 'app-input-data',
  templateUrl: './input-data.component.html',
  styleUrls: ['./input-data.component.scss']
})
export class InputDataComponent implements OnInit {
  fileName= 'ExcelSheet.xlsx';
  userLogs:UserLogs = new UserLogs();
  submitted = false;
  beforeAfter:Array<BeforeAfter> = [];
  exurasio:boolean=false;
  vocations: Array<string> = ['Elite Knight','Royal Paladin','Elder Druid','Master Sorcerer'];
  spells:Array<string> = ['Bruise Bane','Divine Healing','Fair Wound Cleansing','Heal Friend','Intense Healing','Intense Wound Cleansing','Light Healing','Mass Healing','Nature\'s Embrace','Restoration','Salvation','Ultimate Healing','Wound Cleansing'];

  constructor() { }

  ngOnInit(): void {
  }

  onSubmit() { this.submitted = true; }

  parseLogs() {
    this.userLogs.healings=[];
    let rep=this.userLogs.logs.replace(/^[0-9]{2}:[0-9]{2} ([^Y]|Y[^o]|Yo[^u]|You[^ ]|You [^h]|You h[^e]|You he[^a]).*/gm,"");
    rep = rep.replace(/^([A-Za-z].*)/gm,"");

    if(this.exurasio){
      rep = rep.replace(/^[0-9]{2}:[0-9]{2} You heal [A-Za-z ]+ for ([0-9]+) hitpoints./gm,"$1");
    } else {
      rep = rep.replace(/^[0-9]{2}:[0-9]{2} You heal yourself for ([0-9]+) hitpoints./gm,"$1");
    }

    const regex = /[0-9]+/g;
    let m;
    let currentHeal:number=0;
    while ((m = regex.exec(rep)) !== null) {
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }

        m.forEach((match) => {
            currentHeal=Number(match);

            if(currentHeal>this.userLogs.healMax) {
              this.userLogs.healMax=currentHeal;
            }
            if(currentHeal<this.userLogs.healMin) {
              this.userLogs.healMin=currentHeal;
            }
            this.userLogs.healSum+= currentHeal;
            this.userLogs.healings.push(currentHeal);
        });
    }

  }

  generateTable() {
    this.parseLogs();
    this.parseLogs2();
    let qtdRegs = this.userLogs.healings.length>this.userLogs.healings2.length?this.userLogs.healings.length:this.userLogs.healings2.length;
    for (let i=0 ; i < qtdRegs; i++) {
      let ba:BeforeAfter=new BeforeAfter();
      if(this.userLogs.healings.length>i) {
        ba.before = this.userLogs.healings[i];
      }
      if(this.userLogs.healings2.length>i) {
        ba.after = this.userLogs.healings2[i];
      }
      this.beforeAfter.push(ba);
    }
  }

  parseLogs2() {
    this.userLogs.healings2=[];
    let rep=this.userLogs.logs2.replace(/^[0-9]{2}:[0-9]{2} ([^Y]|Y[^o]|Yo[^u]|You[^ ]|You [^h]|You h[^e]|You he[^a]).*/gm,"");
    rep = rep.replace(/^([A-Za-z].*)/mg,"");

    if(this.exurasio){
      rep = rep.replace(/^[0-9]{2}:[0-9]{2} You heal [A-Za-z ]+ for ([0-9]+) hitpoints./gm,"$1");
    } else {
      rep = rep.replace(/^[0-9]{2}:[0-9]{2} You heal yourself for ([0-9]+) hitpoints./gm,"$1");
    }

    const regex = /[0-9]+/g;
    let m;
    let currentHeal:number=0;
    while ((m = regex.exec(rep)) !== null) {
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }

        m.forEach((match) => {
            currentHeal=Number(match);

            if(currentHeal>this.userLogs.healMax2) {
              this.userLogs.healMax2=currentHeal;
            }
            if(currentHeal<this.userLogs.healMin2) {
              this.userLogs.healMin2=currentHeal;
            }
            this.userLogs.healSum2+= currentHeal;
            this.userLogs.healings2.push(currentHeal);
        });
    }

  }

  getAvg():number {
    if(this.userLogs.healSum>0) {
      return (this.userLogs.healSum / this.userLogs.healings.length).toFixed(2) as any;
    }
    return Number(0);
  }

  getAvg2():number {
    if(this.userLogs.healSum2>0) {
      return (this.userLogs.healSum2 / this.userLogs.healings2.length).toFixed(2) as any;
    }
    return Number(0);
  }

  exportExcel() {
    this.fileName=this.userLogs.userName+"_"+this.userLogs.spellName+"_"+"_lvl_"+this.userLogs.level+".xlsx";
    /* table id is passed over here */
    let element = document.getElementById('excel-table');
    const ws: XLSX.WorkSheet =XLSX.utils.table_to_sheet(element);

    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    /* save to file */
    XLSX.writeFile(wb, this.fileName);
  }


}

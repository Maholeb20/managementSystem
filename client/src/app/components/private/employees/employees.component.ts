import { Component, OnInit, ViewChild} from '@angular/core';
import { ngxLoadingAnimationTypes } from 'ngx-loading';
import { NgxLoadingComponent } from 'ngx-loading';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/api'; 
import { EmployeesService } from '../service/employees.service';
import { Employees } from 'src/app/interfaces/employees';
import { Empid } from 'src/app/interfaces/empid';

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class EmployeesComponent implements OnInit {
  @ViewChild('ngxLoading', { static: false })
  ngxLoadingComponent!: NgxLoadingComponent;
  showingTemplate = false;
  public ngxLoadingAnimationTypes = ngxLoadingAnimationTypes;
  public loading = false;

  emp: any 
  totalNumber: number = 0
  productDialog: boolean = false;
  submitted = false;
  term = '';
  emplist!: Empid

  constructor(
    private formBuilder: FormBuilder,
    private messageService: MessageService,  
    private confirmationService: ConfirmationService,
    private employees:EmployeesService) { }
  
  Form = new FormGroup({
    fname: new FormControl(''),
    lname: new FormControl(''),
    phone_number: new FormControl(''),
    salary: new FormControl(''),
    department: new FormControl(''),
  });
  
  
  keyPressAlphanumeric(event: { keyCode: number; preventDefault: () => void; }) {

    var inp = String.fromCharCode(event.keyCode);

    if (/[a-zA-Z]/.test(inp)) {
      return true;
    } else {
      event.preventDefault();
      return false;
    }
  }

  ngOnInit(): void {
    this.loading = true;
    this.Form = this.formBuilder.group({
      fname: ['', Validators.required],
      lname: ['', Validators.required],
      phone_number: ['', [Validators.required, Validators.maxLength(15)]],
      salary: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(40)]],
      department: ['', Validators.required]
    })

    this.getEmp()
  }

  //Open a modal
  openNew(){
    this.submitted = false;
 
    this.productDialog = true;
    this.Form.reset();
  }

  //Save Data from a modal
  saveData(){
    this.submitted = true;
    this.productDialog = true;

    //Validate if modal is empty or no
    if(this.Form.invalid)
    { 
      this.loading = false;
      return
    }
    let user = { //register a new employee
      first_name: this.Form.value.fname,
      last_name: this.Form.value.lname,
      email: this.Form.value.fname+'.'+this.Form.value.lname+'@zoho.com',
      phone_number: this.Form.value.phone_number,
      salary: this.Form.value.salary,
      dept_id: this.Form.value.department
    }

    this.employees.addNewEmp(user).subscribe({
      next:data =>{
        this.loading = true;
        this.productDialog = false;
        
        this.messageService.add({severity:'success', summary: 'Successful', detail: 'Employee Added', life: 3000})
        this.getEmp() 
        this.loading = false;
      },
      error: err => {
        this.loading = false;
        this.messageService.add({severity:'error', summary: 'Error', detail: err.error.message, life: 3000}) 
      }
    }) 
  }

  getEmp(){
    return this.employees.getEmployees().subscribe({
      next:data =>{
        this.loading = true;
       this.emp = data
       this.loading = false;
       this.getTotal(data.length)
      }
    })
  }

  //Get total current employee 
  getTotal(tot:number){
    return this.totalNumber = tot;
  }

  deleteProduct(details:Employees){
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete ' + details.first_name + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        let user ={
          first_name :details.first_name,
          last_name :details.last_name,
          email: details.email,
          phone_number:details.phone_number,
          hiredate:details.hiredate,
          salary:details.salary,
          dept_id:details.dept_id
        }
        this.loading = true;
        this.employees.moveEmpToOldEmp(user, details).subscribe();
        this.employees.deleteEmpByID(details).subscribe();
        this.getEmp();
        this.loading = false;
        this.messageService.add({severity:'success', summary: 'Successful', detail: 'Employee Deleted', life: 3000})
      },
      reject: () => {
        this.loading = false;
        this.messageService.add({severity:'error', summary: 'Error', detail: 'You have rejected', life: 3000})
      }
    })
  }

  hideDialog() {
    this.productDialog = false;
  }
  get f():{ [key: string]: AbstractControl }{
    return this.Form.controls;//it traps errors in the form
  }  










  updateEmp(detail:Empid){
    this.submitted = true;
    console.log(detail)
    if(this.Form.invalid)
    { 
      this.loading = false;
      return
    }

    let user = { //register a new employee
      phone_number: this.emplist.phone_number,
      salary: this.emplist.salary,
      dept_id: this.emplist.dept_id
    }



    // this.employees.updateEmpDetails(user, 1).subscribe({
    //   next:data => {

    //   },
    //   error: err => {
    //     this.loading = false;
    //     this.messageService.add({severity:'error', summary: 'Error', detail: err.error.message, life: 3000}) 
    //   }
    // })
  }


}

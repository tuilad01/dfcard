import { Component, OnInit } from '@angular/core';
import { Group, GroupService, Phrase } from './group.service';
import { NgFor } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { TableModule } from 'primeng/table';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { PanelComponent } from '../components/panel/panel.component';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { v4 as uuid4v } from 'uuid';
const defaultGroup: Group = {
  id: '',
  name: '',
  description: '',
  phrases: [],
};
const defaultPhrase: Phrase = {
  id: '',
  name: '',
  meaning: '',
};

const createGroupFormGroup = ({ id, name, description, phrases }: Group) => {
  return new FormGroup({
    id: new FormControl(id),
    name: new FormControl(name),
    description: new FormControl(description),
    phrases: new FormArray(phrases.map(createPhraseFormGroup)),
  });
};

const createPhraseFormGroup = ({ id, name, meaning }: Phrase) => {
  return new FormGroup({
    id: new FormControl(id),
    name: new FormControl(name),
    meaning: new FormControl(meaning),
  });
};

@Component({
  selector: 'app-group',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgFor,
    TableModule,
    InputGroupModule,
    InputGroupAddonModule,
    InputTextModule,
    PanelModule,
    ButtonModule,
    PanelComponent,
    ConfirmPopupModule,
    ToastModule,
  ],
  providers: [GroupService, ConfirmationService, MessageService],
  templateUrl: './group.component.html',
  styleUrl: './group.component.css',
})
export class GroupComponent implements OnInit {
  constructor(
    private groupService: GroupService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.groupService
      .getGroups()
      .subscribe((groups: any[]) => (this.groups = groups));
  }

  groups: Group[] = [];
  selectedGroup?: Group;
  get isUpdating() {
    return this.selectedGroup != undefined;
  }

  form = createGroupFormGroup(defaultGroup);

  get phrases() {
    return this.form.get('phrases') as FormArray;
  }

  addPhrase() {
    const phrases = this.phrases as FormArray;
    phrases.insert(0, createPhraseFormGroup({...defaultPhrase, id: uuid4v()}));
  }

  // add & update
  submit(event: SubmitEvent) {
    event.preventDefault();
    const group = { ...this.form.value } as Group;
    //console.log(group);

    if (this.isUpdating) {
      // update
      this.groupService.updateGroup(group.id, group).subscribe((data) => {
        //console.log('data', data);
        if (data && data.id) {
          const updatedGroup = this.groups.find((gr) => gr.id == data.id);
          if (updatedGroup) {
            updatedGroup.name = data.name;
            updatedGroup.description = data.description;
            updatedGroup.phrases = data.phrases;

            this.form = createGroupFormGroup(data);

            this.messageService.add({
              severity: 'info',
              summary: 'Result',
              detail: 'The record updated',
              life: 3000,
            });
          }
        }
      });

      return;
    }

    // add
    this.groupService.createGroup(group).subscribe((data) => {
      if (data && data.id) {
        this.groups.push(data);
        this.form = createGroupFormGroup(defaultGroup);

        this.messageService.add({
          severity: 'info',
          summary: 'Result',
          detail: 'A record added',
          life: 3000,
        });
      }
    });
  }

  selectRecord(group: Group) {
    this.selectedGroup = group;
    this.form = createGroupFormGroup(group);
  }

  cancelUpdating() {
    this.form = createGroupFormGroup(defaultGroup);
    this.selectedGroup = undefined;
  }

  deleteRecord(event: Event, group: Group) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Do you want to delete this record?',
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      accept: () => {
        this.groupService.deleteGroup(group.id).subscribe((result) => {
          if (result) {
            this.groups = this.groups.filter((gr) => gr.id !== group.id);

            this.messageService.add({
              severity: 'info',
              summary: 'Confirmed',
              detail: 'Record deleted',
              life: 3000,
            });
          }
        });
      },
      reject: () => {
        // do something...
        // this.messageService.add({
        //   severity: 'error',
        //   summary: 'Rejected',
        //   detail: 'You have rejected',
        //   life: 3000,
        // });
      },
    });
  }

  deletePhrase(event: Event, index: number) {
    this.phrases.removeAt(index);
  }
}

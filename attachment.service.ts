import {Injectable} from '@angular/core';
import {environment} from "../../../../environments/environment.development";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable, of} from "rxjs";
import {ApiAttachment} from "@core/infrastructure/Apis/api-attachment";
import {FormAttachment} from "@core/models/form-attachment.model";
import {ApiLookupTables} from "@core/infrastructure/Apis/api-lookup-tables";
import {Attachment} from "@core/models/attachment.model";
import {FileHelper} from "@core/helpers/file-helper";

@Injectable({
  providedIn: 'root'
})
export class AttachmentService {
  private attachmentURL: string = environment.attachmentUrl;

  constructor(private httpClient: HttpClient) {
  }

  //Atachment
  AddAttachment$(data: Attachment, blobData: Blob): Observable<any> {
    try {
      const uri = ApiAttachment.AddAttachment(this.attachmentURL);
      const formData = new FormData();
      for (const [key, value] of Object.entries(data)) {
        if (key.toLowerCase() === 'File'.toLowerCase()) {
          formData.append(key, blobData, data.file?.name);
        } else {
          formData.append(key, value as string);
        }
      }
      return this.httpClient.post(uri, formData);
    } catch (e) {
      console.error('error uploading file', e);
      return of([])
    }
  }

  GetAttachmentByIdentifier(attachmentIdentifier: string): Observable<any> {
    try {
      let uri = ApiAttachment.GetAttachmentByIdentifier(this.attachmentURL, attachmentIdentifier);
      return this.httpClient.get(uri);
    } catch (error) {
      console.log(error);
      return of([])
    }
  }

  GetAttachmentById(attachmentId: string): Observable<any> {
    try {
      let uri = ApiAttachment.GetAttachmentById(this.attachmentURL, attachmentId);
      return this.httpClient.get(uri);
    } catch (error) {
      console.log(error);
      return of([])
    }
  }

  GetAttachmentsByEntityType(entityType: string): Observable<any> {
    try {
      const uri = ApiAttachment.GetAttachmentsByEntityType(this.attachmentURL, entityType);
      return this.httpClient.get(uri)
    } catch (error) {
      console.error(error);
      return of([])
    }
  }

  DeleteAttachmentByIdentifier(identifier: string): Observable<any> {
    try {
      const uri = ApiAttachment.DeleteAttachmentByIdentifier(this.attachmentURL, identifier);
      return this.httpClient.delete(uri);
    } catch (e) {
      console.error(e);
      return of({})
    }
  }

  DeleteAttachmentById(attachmentId: string): Observable<any> {
    try {
      const uri = ApiAttachment.DeleteAttachmentById(this.attachmentURL, attachmentId);
      return this.httpClient.delete(uri);
    } catch (e) {
      console.error(e);
      return of({})
    }
  }


  DownloadAttachmentByIdentifier(identifier: string): Observable<any> {
    try {
      const uri = ApiAttachment.DownloadAttachmentByIdentifier(this.attachmentURL, identifier);
      return this.httpClient.get(uri);
    } catch (error) {
      console.error(error);
      return of({})
    }
  }

  DownloadAttachmentById(attachmentId: string): Observable<any> {
    try {
      const uri = ApiAttachment.DownloadAttachmentById(this.attachmentURL, attachmentId);
      return this.httpClient.get(uri);
    } catch (error) {
      console.error(error);
      return of({})
    }
  }


  //AttachmentCategory
  GetAttachmentCategories$(): Observable<any> {
    try {
      var uri = ApiAttachment.GetAllAttachmentCategories(this.attachmentURL);
      return this.httpClient.get(uri);
    } catch (error) {
      console.log(error);
      return of([]);
    }
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {

  // API url
  //baseApiUrl = "http://52.5.47.64:8089/api/images/upload"
  baseApiUrl = "http://52.5.47.64:3000/upload"
  //baseApiUrl = "https://dev.oscorp.com.pe:3000/upload"

  baseApiDocsUrl = "http://52.5.47.64:3001/upload"
  //baseApiDocsUrl = "https://dev.oscorp.com.pe:3001/upload"

  constructor(private http:HttpClient) { }

  // Returns an observable
  upload(file):Observable<any> {

    console.log(file)

    var f= new Subject<boolean>();

    // Create form data
    const formData = new FormData();

    // Store form name as "file" with file data
    formData.append("file", file, file.name);

    // Make http post request over api
    // with formData as req
    return this.http.post(this.baseApiUrl, formData)


  }

  getFile(url):Observable<any> {
    return this.http.get(url);
  }




  uploadDoc(file:File):Observable<any> {
    console.log(file)
    const originalName = file.name;
    console.log(originalName)
    const extension = originalName.split('.').pop().toLowerCase();

    var dateNum = String(Date.now());
    const newName = dateNum+`.${extension}`;

    var f= new Subject<boolean>();

    // Create form data
    const formData = new FormData();

    // Store form name as "file" with file data
    formData.append("file", file, newName);

    // Make http post request over api
    // with formData as req
    return this.http.post(this.baseApiDocsUrl, formData)


  }

  uploadDocWithName(formData):Observable<any> {

  

    // Make http post request over api
    // with formData as req
    return this.http.post(this.baseApiDocsUrl, formData)


  }

}

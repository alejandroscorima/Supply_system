import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {

  // API url
  baseApiUrl = "http://34.207.60.246:8089/api/images/upload"

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
}

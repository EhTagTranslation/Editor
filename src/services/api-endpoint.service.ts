import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiEndpointService {
  get github() { return 'https://api.github.com/'; }
  get ehTagConnector() { return 'https://ehtagconnector.azurewebsites.net/api/database/'; }
}

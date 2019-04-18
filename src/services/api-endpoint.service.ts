import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiEndpointService {

  private makePath(root: string, path: string) {
    if (path.startsWith('/') || path === '') {
      return root + path;
    } else {
      return root + '/' + path;
    }
  }
  github(path: string = '') {
    return this.makePath('https://api.github.com', path);
  }
  ehTagConnectorDb(path: string = '') {
    return this.makePath('https://ehtagconnector.azurewebsites.net/api/database', path);
  }
  ehTagConnectorTools(path: string = '') {
    return this.makePath('https://ehtagconnector.azurewebsites.net/api/tools', path);
  }
}

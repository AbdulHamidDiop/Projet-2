import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

@Component({
    selector: 'app-admin-page',
    templateUrl: './admin-page.component.html',
    styleUrls: ['./admin-page.component.scss'],
})
export class AdminPageComponent {
    password: string = '';
    
    constructor(private http: HttpClient) {}

    verifyPassword() {
        this.http.post('http://localhost:3000/verify-password', { password: this.password })
            .subscribe((response: any) => {
                if (response.success) {
                    // Password is correct, navigate to the admin page
                    window.location.href = '/admin';
                } else {
                    alert('Incorrect password');
                }
            });
    }

}

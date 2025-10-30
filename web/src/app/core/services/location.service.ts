import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface DepartmentDTO {
  id: number;
  name: string;
  code: string;
}

export interface CityDTO {
  id: number;
  name: string;
  departmentId: number;
}

@Injectable({ providedIn: 'root' })
export class LocationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/location';

  async listDepartments(): Promise<DepartmentDTO[]> {
    return await firstValueFrom(this.http.get<DepartmentDTO[]>(`${this.baseUrl}/departments`));
  }

  async listCities(departmentId: number): Promise<CityDTO[]> {
    return await firstValueFrom(
      this.http.get<CityDTO[]>(`${this.baseUrl}/departments/${departmentId}/cities`),
    );
  }
}


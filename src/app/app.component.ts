import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  cityName: string = '';
  weatherData: any;
  iconUrl: string = '';
  currentDate: string = '';
  loading: boolean = false;
  error: string = '';
  latitude: number | null = null;
  longitude: number | null = null;

  private url = 'https://api.openweathermap.org/data/2.5/weather';
  private apiKey = 'f00c38e0279b7bc85480c3fe775d518c';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.getLocation();
  }

  getLocation(): void {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.latitude = position.coords.latitude;
          this.longitude = position.coords.longitude;
          console.log(`Latitude: ${this.latitude}, Longitude: ${this.longitude}`);
          this.getCityName(this.latitude, this.longitude); 
        },
        (error) => {
          console.error('Error getting location:', error);
          this.error = 'Unable to retrieve location.';
        }
      );
    } else {
      console.error('Geolocation is not available in this browser.');
      this.error = 'Geolocation not supported by your browser.';
    }
  }

  getCityName(lat: number, lon: number): void {
    const geocodingApiUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;

    this.http.get(geocodingApiUrl).subscribe({
      next: (response: any) => {
        this.cityName = response.city || response.locality || 'Unknown location';
        console.log(`City Name: ${this.cityName}`);
        if (this.cityName && this.cityName !== 'Unknown location') {
          this.getWeather(); // Fetch weather only after city name is set
        } else {
          this.error = 'Unable to determine your city.';
        }
      },
      error: (err) => {
        console.error('Error fetching city name:', err);
        this.error = 'Error fetching city name. Please try again.';
      }
    });
  }

  getWeather(): void {
    this.loading = true;
    this.error = '';
    const fullUrl = `${this.url}?q=${this.cityName}&appid=${this.apiKey}&units=metric`;
    this.http.get(fullUrl).subscribe(
      (data: any) => {
        this.weatherData = data;
        this.cdr.detectChanges(); // Force change detection
        console.log(this.weatherData);
        this.iconUrl = `https://openweathermap.org/img/w/${data.weather[0].icon}.png`;
        document
          .getElementById('weather-info')
          ?.style.setProperty('display', 'block');
        this.loading = false;
      },
      (error) => {
        this.error = 'City not found. Please try again.';
        this.loading = false;
        console.error('Error fetching weather data:', error);
      }
    );
  }
}

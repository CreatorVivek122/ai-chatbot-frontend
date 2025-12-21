import { provideHttpClient } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { FormsModule } from '@angular/forms';

export const appConfig = {
  providers: [
    provideHttpClient(),
    importProvidersFrom(FormsModule)
  ]
};

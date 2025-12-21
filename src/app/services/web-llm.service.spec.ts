import { TestBed } from '@angular/core/testing';

import { WebLlmService } from './web-llm.service';

describe('WebLlmService', () => {
  let service: WebLlmService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WebLlmService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

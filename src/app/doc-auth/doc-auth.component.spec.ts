import { TestBed, inject } from '@angular/core/testing';

import { DocAuthComponent } from './doc-auth.component';

describe('a doc-auth component', () => {
	let component: DocAuthComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				DocAuthComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([DocAuthComponent], (DocAuthComponent) => {
		component = DocAuthComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});
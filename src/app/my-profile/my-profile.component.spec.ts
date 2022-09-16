import { TestBed, inject } from '@angular/core/testing';

import { MyProfileComponent } from './my-profile.component';

describe('a my-profile component', () => {
	let component: MyProfileComponent;

	// register all needed dependencies
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				MyProfileComponent
			]
		});
	});

	// instantiation through framework injection
	beforeEach(inject([MyProfileComponent], (MyProfileComponent) => {
		component = MyProfileComponent;
	}));

	it('should have an instance', () => {
		expect(component).toBeDefined();
	});
});
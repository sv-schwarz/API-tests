import { faker } from "@faker-js/faker";

export function register() {

    const testEmail = faker.internet.email();
    const testPassword = faker.internet.password();

    return cy.request('POST', '/register', {
        email: testEmail,
        password: testPassword,
    }).then(response => {
        expect(response.status).to.equal(201);
        expect(response.body).to.have.property('accessToken');
        expect(response.body.user).to.have.property('email');
        expect(response.body.user).to.have.property('id');

        return response.body;
    });
}

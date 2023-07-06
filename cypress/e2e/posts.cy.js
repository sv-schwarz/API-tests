import { faker } from '@faker-js/faker'
import { register, login } from '../support/helper'

const postData = {
  title: faker.lorem.sentence(),
  body: faker.lorem.paragraph()
};
const updatedData = {
  title: faker.lorem.sentence(),
  body: faker.lorem.paragraph()
};

it('Get posts', () => {
  cy.log(`Get all posts`)

  cy.request('GET', `/posts`).then(response => {
    expect(response.status).to.be.equal(200);
    expect(response.headers['content-type']).to.include('application/json');
  });
});

it('Get 10 posts', () => {
  cy.log(`Get first 10 posts`)

  cy.request('GET', `/posts?_page=1&_limit=10`).then(response => {
    expect(response.status).to.be.equal(200);
    expect(response.body).to.have.lengthOf(10);
  });
});

it('Get posts with id 55 and 60', () => {
  cy.log('Get posts with id 55 and 60');

  cy.request('GET', '/posts?id=55&id=60').then(response => {
    expect(response.status).to.equal(200);
    expect(response.body).to.have.lengthOf(2);

    const postIds = response.body.map(post => post.id);
    expect(postIds).to.include(55);
    expect(postIds).to.include(60);
  });
});

it('Create a fail post', () => {
  cy.log('Create a fail post');
  cy.request({
    failOnStatusCode: false,
    method: 'POST',
    url: `/664/posts${postData}`,
    body: {
      data: postData,
    }
  }).then(response => {
    expect(response.status).to.equal(401);
  });
});

it('Create a success post', () => {
  cy.log('Create a success post');

  register().then(response => {
    const userId = response.user.id;
    const accessToken = response.accessToken;

    cy.request({
      method: 'POST',
      url: `/664/posts`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: {
        ...postData,
        userId: userId,
      },
    }).then(response => {
      expect(response.status).to.equal(201);

      const createdPost = response.body;
      expect(createdPost).to.have.property('id');
      expect(createdPost.title).to.equal(postData.title);
      expect(createdPost.body).to.equal(postData.body);
      expect(createdPost.userId).to.equal(userId);
    });
  });
});

it('Create post entity and verify', () => {
  cy.log('Create post entity and verify');

  cy.request({
    method: 'POST',
    url: '/posts',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(postData),
  }).then(response => {
    expect(response.status).to.equal(201);

    const createdEntity = response.body;

    expect(createdEntity).to.have.property('id');
    expect(createdEntity.title).to.equal(postData.title);
    expect(createdEntity.body).to.equal(postData.body);
  });
});

it('Update non-existing entity and verify', () => {
  cy.log('Update non-existing entity and verify');

  cy.request({
    method: 'PUT',
    url: '/posts/non-existing-id',
    failOnStatusCode: false,
    headers: {
      'Content-Type': 'application/json',
    },
    body: updatedData,
  }).then(response => {
    expect(response.status).to.equal(404);
  });
});

it('Create post entity and update the created entity', () => {
  cy.log('Create post entity and update the created entity');

  let createdEntityId;

  cy.request({
    method: 'POST',
    url: '/posts',
    headers: {
      'Content-Type': 'application/json',
    },
    body: postData,
  }).then(response => {
    expect(response.status).to.equal(201);
    expect(response.body).to.have.property('id');

    createdEntityId = response.body.id;

    cy.request({
      method: 'PUT',
      url: `/posts/${createdEntityId}`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: updatedData,
    }).then(response => {
      expect(response.status).to.equal(200);

      const updatedEntity = response.body;
      expect(updatedEntity.title).to.equal(updatedData.title);
      expect(updatedEntity.body).to.equal(updatedData.body);
    });
  });
});

it('Delete non-existing post entity', () => {
  cy.log('Delete non-existing post entity');

  cy.request({
    method: 'DELETE',
    url: '/posts/non-existing-id',
    failOnStatusCode: false,
  }).then(response => {
    expect(response.status).to.equal(404);
  });
});

it('Create, update, and delete post entity', () => {
  cy.log('Create, update, and delete post entity');

  let createdEntityId;

  cy.request({
    method: 'POST',
    url: '/posts',
    headers: {
      'Content-Type': 'application/json',
    },
    body: postData,
  }).then(response => {
    expect(response.status).to.equal(201);
    expect(response.body).to.have.property('id');

    createdEntityId = response.body.id;

    cy.request({
      method: 'PUT',
      url: `/posts/${createdEntityId}`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: updatedData,
    }).then(response => {
      expect(response.status).to.equal(200);
      expect(response.body.title).to.equal(updatedData.title);
      expect(response.body.body).to.equal(updatedData.body);

      cy.request({
        method: 'DELETE',
        url: `/posts/${createdEntityId}`,
      }).then(response => {
        expect(response.status).to.equal(200);

        cy.request({
          method: 'GET',
          url: `/posts/${createdEntityId}`,
          failOnStatusCode: false,
        }).then(response => {
          expect(response.status).to.equal(404);
        });
      });
    });
  });
});


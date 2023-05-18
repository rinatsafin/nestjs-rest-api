import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
// import * as request from 'supertest'; // default library by nest.js to test HTTP requests
import * as pactum from 'pactum'; // library to test HTTP requests
import { AppModule } from '@/app.module';
import { PrismaService } from '@/entity/prisma/prisma.service';
import { AuthDto } from '@/entity/auth/dto';
import { CreateBookmarkDto, EditBookmarkDto } from '@/entity/bookmark/dto';

describe('App e2e init test', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const userAuthDto: AuthDto = {
    email: 'testemail@mail.test',
    password: 'testpassword',
    firstName: 'testfirstname',
    lastName: 'testlastname',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3333);
    prisma = app.get(PrismaService);
    await prisma.clearDB();
    pactum.request.setBaseUrl('http://localhost:3333');
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Auth', () => {
    describe('Singup', () => {
      it('should be successful', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withJson(userAuthDto)
          .expectStatus(HttpStatus.CREATED);
        // Note: You can use .inspect() to see the response body
      });
      it('should be singup throw if email is empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withJson({
            ...userAuthDto,
            email: undefined,
          })
          .expectStatus(HttpStatus.BAD_REQUEST);
      });
      it('should be singup throw if password is empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withJson({
            ...userAuthDto,
            password: undefined,
          })
          .expectStatus(HttpStatus.BAD_REQUEST);
      });
      it('should be singup throw if no body provided', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .expectStatus(HttpStatus.BAD_REQUEST);
      });
    });

    describe('Signin', () => {
      it('should be throw error status code if email is empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withJson({
            password: userAuthDto.password,
          })
          .expectStatus(HttpStatus.BAD_REQUEST);
      });
      it('should be throw error status code if password is empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withJson({
            email: userAuthDto.email,
          })
          .expectStatus(HttpStatus.BAD_REQUEST);
      });
      it('should be throw error status code if no body provided', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .expectStatus(HttpStatus.BAD_REQUEST);
      });
      it('should be successful', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withJson({
            email: userAuthDto.email,
            password: userAuthDto.password,
          })
          .expectStatus(HttpStatus.OK)
          .stores('userAccessToken', 'access_token');
        // Note: You can use .inspect() to see the response body
      });
    });
  });

  describe('User', () => {
    describe('Get user info', () => {
      it('should get user info', () => {
        return (
          pactum
            .spec()
            .get('/users/user-info')
            .withBearerToken('$S{userAccessToken}')
            // Note: We can use .withHeaders() to set headers
            // .withHeaders({
            //   Authorization: 'Bearer $S{userAccessToken}',
            // })
            .expectStatus(HttpStatus.OK)
        );
      });
    });

    describe('Edit user', () => {
      const userEditDto = {
        email: 'useremail2@mail.test.com',
        firstName: 'userfirstname2',
        lastName: 'userlastname2',
      };

      it('should be edited', () => {
        return pactum
          .spec()
          .patch('/users/edit-user')
          .withBearerToken('$S{userAccessToken}')
          .withJson(userEditDto)
          .expectStatus(HttpStatus.OK)
          .expectBodyContains(userEditDto.email)
          .expectBodyContains(userEditDto.firstName)
          .expectBodyContains(userEditDto.lastName);
      });
    });
  });

  describe('Bookmark', () => {
    const createBookmarkDto: CreateBookmarkDto = {
      title: 'First bookmark',
      url: 'https://www.youtube.com/watch?v=GHTA143_b-s',
      description: 'NestJs Course for Beginners - Create a REST API',
    };
    const editBookmarkDto: EditBookmarkDto = {
      title: 'Kubernetes Course - Full Beginners Tutorial',
      url: 'https://www.youtube.com/watch?v=d6WC5n9G_sM',
      description:
        'Learn how to use Kubernetes in this complete course. Kubernetes makes it possible to containerize applications and simplifies app deployment to production.',
    };
    describe('Get empty bookmarks', () => {
      it('should be empty list of bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withBearerToken('$S{userAccessToken}')
          .expectStatus(HttpStatus.OK)
          .expectBody([]);
      });
    });

    describe('Create bookmark', () => {
      it('should be create bookmark', () => {
        return pactum
          .spec()
          .post('/bookmarks/create-bookmark')
          .withBearerToken('$S{userAccessToken}')
          .withBody(createBookmarkDto)
          .expectStatus(HttpStatus.CREATED)
          .stores('bookmarkId', 'id');
      });
    });

    describe('Get bookmarks', () => {
      it('should be list of bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withBearerToken('$S{userAccessToken}')
          .expectStatus(HttpStatus.OK)
          .expectJsonLength(1);
      });
    });

    describe('Get bookmark by id', () => {
      it('should be get bookmark', () => {
        return pactum
          .spec()
          .get('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withBearerToken('$S{userAccessToken}')
          .expectStatus(HttpStatus.OK)
          .expectBodyContains(createBookmarkDto.title)
          .expectBodyContains('$S{bookmarkId}');
      });
    });

    describe('Edit bookmark by id', () => {
      it('should be edited', () => {
        return pactum
          .spec()
          .patch('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withBearerToken('$S{userAccessToken}')
          .withJson(editBookmarkDto)
          .expectStatus(HttpStatus.OK)
          .expectBodyContains(editBookmarkDto.title)
          .expectBodyContains('$S{bookmarkId}')
          .expectBodyContains(editBookmarkDto.url)
          .expectBodyContains(editBookmarkDto.description);
      });
    });

    describe('Delete bookmark by id', () => {
      it('should be deleted', () => {
        return pactum
          .spec()
          .delete('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withBearerToken('$S{userAccessToken}')
          .expectStatus(HttpStatus.NO_CONTENT);
      });

      it('should be empty list of bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withBearerToken('$S{userAccessToken}')
          .expectStatus(HttpStatus.OK)
          .expectJsonLength(0);
      });
    });
  });

  // it('/ (GET)', () => {
  //   return request(app.getHttpServer())
  //     .get('/')
  //     .expect(200)
  //     .expect('Hello World!');
  // });
});

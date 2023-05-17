import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
// import * as request from 'supertest'; // default library by nest.js to test HTTP requests
import * as pactum from 'pactum'; // library to test HTTP requests
import { AppModule } from '@/app.module';
import { PrismaService } from '@/entity/prisma/prisma.service';
import { AuthDto } from '@/entity/auth/dto';

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
          .stores('userAccessToken', 'access_token')
          .inspect();
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

    // describe('Edit user', () => {
    //   const userEditDto = {
    //     email: 'useremail2@mail.test.com',
    //     firstName: 'userfirstname2',
    //     lastName: 'userlastname2',
    //   };
    //   it('user profile should be edited', () => {
    //     return pactum
    //       .spec()
    //       .put('/users/edit-user')
    //       .withJson(userEditDto)
    //       .expectBodyContains(userEditDto.email);
    //   });
    // });
  });

  describe('Bookmark', () => {
    describe('Create bookmark', () => {
      it.todo('should be create bookmark');
    });

    describe('Get bookmarks', () => {
      it.todo('should be edit bookmark');
    });

    describe('Get bookmark by id', () => {
      it.todo('should be edit bookmark');
    });

    describe('Edit bookmark by id', () => {
      it.todo('should be edit bookmark');
    });

    describe('Delete bookmark by id', () => {
      it.todo('should be delete bookmark');
    });
  });

  // it('/ (GET)', () => {
  //   return request(app.getHttpServer())
  //     .get('/')
  //     .expect(200)
  //     .expect('Hello World!');
  // });
});

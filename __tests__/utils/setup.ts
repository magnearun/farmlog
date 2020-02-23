require('dotenv').config(); // tslint:disable-line no-var-requires

jest.mock('turndown', () => {
  return class TurndownMock {
    public turndown(a: string) {
      return a;
    }
  };
});

jest.setTimeout(30000);

afterAll(done => {
  done();
});

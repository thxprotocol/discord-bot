import inLast from '../inLast';

test('Check if inLast setted to 10 second return false when input is over 10 seccond', () => {
  const inLastTenSeccond = inLast(10);
  const passElevenSeccond = new Date().getTime() - 11000;
  expect(inLastTenSeccond(passElevenSeccond)).toEqual(false);
});

test('Check if inLast setted to 10 second return true when input is over 9 seccond', () => {
  const inLastTenSeccond = inLast(10);
  const passNineSecconds = new Date().getTime() - 9000;
  expect(inLastTenSeccond(passNineSecconds)).toEqual(true);
});

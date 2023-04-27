import {expect, test} from '@playwright/test';

test.describe('Retro', () => {
  test.describe('Create', () => {
    test('Succeeds', async ({page}) => {
      await page.request.post('/api/login', {
        data: {email: 'bilbo.baggins@middle-earth.org', password: 'password'},
      });

      await page.goto('/retro/create');

      const ts = Date.now();

      await page.getByLabel('Name').click();
      await page.getByLabel('Name').fill(`Retro name ${ts}`);

      await page.getByLabel('Description').fill('Retro description');

      await page.getByLabel('Date').fill('2023-05-23');

      await page.getByLabel('Time').fill('20:36');

      await page.getByRole('button', {name: 'Add Question'}).click();
      await page.getByPlaceholder('Enter question text').fill('Question text 1');
      await page.getByRole('button', {name: 'Add Question'}).click();
      await page.getByRole('textbox', {name: 'Enter question text'}).fill('Question text 2');

      await page.getByRole('button', {name: 'Create Retro'}).click();

      await expect(page.getByRole('link', {name: `Retro name ${ts}`})).toBeVisible();
    });
  });
});

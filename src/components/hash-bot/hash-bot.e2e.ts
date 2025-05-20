import { newE2EPage } from '@stencil/core/testing';

describe('hash-bot', () => {
  it('renders', async () => {
    const page = await newE2EPage();

    await page.setContent('<hash-bot></hash-bot>');
    const element = await page.find('hash-bot');
    expect(element).toHaveClass('hydrated');
  });

  it('renders changes to the name data', async () => {
    const page = await newE2EPage();

    await page.setContent('<hash-bot></hash-bot>');
    const component = await page.find('hash-bot');
    const element = await page.find('hash-bot >>> div');
    expect(element.textContent).toEqual(`Hello, World! I'm `);

    component.setProperty('first', 'James');
    await page.waitForChanges();
    expect(element.textContent).toEqual(`Hello, World! I'm James`);

    component.setProperty('last', 'Quincy');
    await page.waitForChanges();
    expect(element.textContent).toEqual(`Hello, World! I'm James Quincy`);

    component.setProperty('middle', 'Earl');
    await page.waitForChanges();
    expect(element.textContent).toEqual(`Hello, World! I'm James Earl Quincy`);
  });
});
